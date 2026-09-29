import { useMemo } from 'react';
import { formatPhone } from '../api/phone';
import type { Chat, Message } from '../types';
import NewChatForm from './NewChatForm';

interface ChatListProps {
  chats: Chat[];
  messages: Message[];
  activeChatId: string | null;
  online: boolean;
  creating: boolean;
  createError: string;
  onSelect: (chatId: string) => void;
  onCreate: (phone: string) => void;
  onLogout: () => void;
}

export default function ChatList({
  chats,
  messages,
  activeChatId,
  online,
  creating,
  createError,
  onSelect,
  onCreate,
  onLogout,
}: ChatListProps) {
  const lastMessages = useMemo(() => {
    const map = new Map<string, Message>();
    for (const message of messages) {
      map.set(message.chatId, message);
    }
    return map;
  }, [messages]);

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <div className="sidebar__brand">
          <span className="logo logo--small">MAX</span>
          <span className={`status ${online ? 'status--online' : 'status--offline'}`}>
            {online ? 'на связи' : 'нет связи'}
          </span>
        </div>
        <button type="button" className="icon-button" onClick={onLogout}>
          Выйти
        </button>
      </header>

      <NewChatForm creating={creating} error={createError} onCreate={onCreate} />

      <div className="chat-list">
        {chats.length === 0 ? (
          <p className="chat-list__empty">
            Пока нет чатов.
            <br />
            Добавьте номер получателя, чтобы начать переписку.
          </p>
        ) : (
          chats.map((chat) => {
            const last = lastMessages.get(chat.id);
            return (
              <button
                key={chat.id}
                type="button"
                className={`chat-item ${chat.id === activeChatId ? 'chat-item--active' : ''}`}
                onClick={() => onSelect(chat.id)}
              >
                <span className="chat-item__avatar">{avatarChar(chat)}</span>
                <span className="chat-item__body">
                  <span className="chat-item__name">{chatTitle(chat)}</span>
                  <span className="chat-item__preview">
                    {last ? `${last.outgoing ? 'Вы: ' : ''}${last.text}` : formatPhone(chat.phone) || chat.id}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

function chatTitle(chat: Chat): string {
  return chat.name || formatPhone(chat.phone) || chat.id;
}

function avatarChar(chat: Chat): string {
  const source = chat.name || chat.phone;
  return source ? source[0].toUpperCase() : '#';
}
