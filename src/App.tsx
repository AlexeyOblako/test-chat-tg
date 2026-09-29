import { useCallback, useEffect, useMemo, useState } from 'react';
import { checkAccount, getStateInstance, sendMessage, setSettings } from './api/greenApi';
import { parseIncomingText } from './api/notifications';
import { normalizePhone } from './api/phone';
import {
  loadChats,
  loadCredentials,
  loadMessages,
  saveChats,
  saveCredentials,
  saveMessages,
} from './api/storage';
import ChatList from './components/ChatList';
import ChatView from './components/ChatView';
import LoginForm from './components/LoginForm';
import { useNotificationPolling } from './hooks/useNotificationPolling';
import type { Chat, GreenApiCredentials, Message, NotificationBody } from './types';

type AuthState = 'idle' | 'checking' | 'ready' | 'failed';

const DEFAULT_API_URL = 'https://api.green-api.com';

const INSTANCE_STATES: Record<string, string> = {
  notAuthorized: 'Инстанс не авторизован. Отсканируйте QR-код в личном кабинете GREEN-API.',
  starting: 'Инстанс запускается. Попробуйте подключиться через минуту.',
  blocked: 'Инстанс заблокирован.',
  yellowCard: 'На инстансе временные ограничения со стороны MAX.',
  suspended: 'Аккаунт MAX временно ограничен.',
};

export default function App() {
  const [credentials, setCredentials] = useState<GreenApiCredentials | null>(() => loadCredentials());
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [authError, setAuthError] = useState('');

  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (!credentials) {
      setAuthState('idle');
      return;
    }

    let cancelled = false;
    setAuthState('checking');
    setAuthError('');

    const connect = async () => {
      try {
        const state = await getStateInstance(credentials);
        if (state !== 'authorized') {
          throw new Error(INSTANCE_STATES[state] ?? `Инстанс недоступен: ${state}`);
        }
        await setSettings(credentials);
        if (!cancelled) {
          setAuthState('ready');
        }
      } catch (caught) {
        if (!cancelled) {
          setAuthState('failed');
          setAuthError(caught instanceof Error ? caught.message : 'Не удалось подключиться к инстансу');
        }
      }
    };

    void connect();

    return () => {
      cancelled = true;
    };
  }, [credentials]);

  const handleNotification = useCallback((body: NotificationBody) => {
    const incoming = parseIncomingText(body);
    if (!incoming) {
      return;
    }

    setChats((current) => {
      if (current.some((chat) => chat.id === incoming.chatId)) {
        return current;
      }
      return [...current, { id: incoming.chatId, phone: incoming.phone, name: incoming.senderName }];
    });

    setMessages((current) => {
      if (current.some((message) => message.id === incoming.idMessage)) {
        return current;
      }
      return [
        ...current,
        {
          id: incoming.idMessage,
          chatId: incoming.chatId,
          text: incoming.text,
          outgoing: false,
          timestamp: incoming.timestamp,
          status: 'sent',
        },
      ];
    });
  }, []);

  useNotificationPolling(authState === 'ready' ? credentials : null, handleNotification, setError);

  const handleLogin = useCallback((next: GreenApiCredentials) => {
    setError('');
    saveCredentials(next);
    setCredentials(next);
  }, []);

  const handleLogout = useCallback(() => {
    saveCredentials(null);
    setCredentials(null);
    setChats([]);
    setMessages([]);
    setActiveChatId(null);
    setError('');
    setCreateError('');
  }, []);

  const handleCreateChat = useCallback(
    async (rawPhone: string) => {
      if (!credentials) {
        return;
      }

      const phone = normalizePhone(rawPhone);
      setCreateError('');

      if (!phone) {
        setCreateError('Введите номер в формате +7 999 123-45-67');
        return;
      }

      setCreating(true);
      try {
        const account = await checkAccount(credentials, Number(phone));
        if (!account.exist || !account.chatId) {
          setCreateError('У этого номера нет аккаунта MAX');
          return;
        }

        setChats((current) => {
          if (current.some((chat) => chat.id === account.chatId)) {
            return current;
          }
          return [...current, { id: account.chatId, phone, name: '' }];
        });
        setActiveChatId(account.chatId);
      } catch (caught) {
        setCreateError(caught instanceof Error ? caught.message : 'Не удалось проверить номер');
      } finally {
        setCreating(false);
      }
    },
    [credentials],
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!credentials || !activeChatId) {
        return;
      }

      const localId = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const pending: Message = {
        id: localId,
        chatId: activeChatId,
        text,
        outgoing: true,
        timestamp: Date.now(),
        status: 'pending',
      };

      setMessages((current) => [...current, pending]);
      setError('');

      try {
        const idMessage = await sendMessage(credentials, activeChatId, text);
        setMessages((current) =>
          current.map((message) =>
            message.id === localId ? { ...message, id: idMessage, status: 'sent' } : message,
          ),
        );
      } catch (caught) {
        setMessages((current) =>
          current.map((message) => (message.id === localId ? { ...message, status: 'failed' } : message)),
        );
        setError(caught instanceof Error ? caught.message : 'Сообщение не отправлено');
      }
    },
    [activeChatId, credentials],
  );

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [chats, activeChatId],
  );

  const activeMessages = useMemo(
    () =>
      messages
        .filter((message) => message.chatId === activeChatId)
        .sort((first, second) => first.timestamp - second.timestamp),
    [messages, activeChatId],
  );

  if (!credentials || authState === 'failed') {
    return (
      <LoginForm
        initial={credentials}
        defaultApiUrl={DEFAULT_API_URL}
        loading={authState === 'checking'}
        error={authError}
        onSubmit={handleLogin}
      />
    );
  }

  const checking = authState === 'checking' || authState === 'idle';

  return (
    <div className={`app ${activeChat ? 'app--chat-open' : ''}`}>
      {checking && <div className="app__overlay">Проверяем подключение…</div>}
      <ChatList
        chats={chats}
        messages={messages}
        activeChatId={activeChatId}
        online={authState === 'ready'}
        creating={creating}
        createError={createError}
        onSelect={setActiveChatId}
        onCreate={handleCreateChat}
        onLogout={handleLogout}
      />
      <ChatView
        chat={activeChat}
        messages={activeMessages}
        error={error}
        onSend={handleSend}
        onDismissError={() => setError('')}
        onBack={() => setActiveChatId(null)}
      />
    </div>
  );
}
