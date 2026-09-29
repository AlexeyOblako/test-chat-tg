import { formatPhone } from '../api/phone';
import type { Chat, Message } from '../types';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

interface ChatViewProps {
  chat: Chat | null;
  messages: Message[];
  error: string;
  onSend: (text: string) => void;
  onDismissError: () => void;
  onBack: () => void;
}

export default function ChatView({ chat, messages, error, onSend, onDismissError, onBack }: ChatViewProps) {
  if (!chat) {
    return (
      <section className="chat">
        <div className="chat__empty">Выберите чат или создайте новый по номеру телефона</div>
      </section>
    );
  }

  const title = chat.name || formatPhone(chat.phone) || chat.id;
  const subtitle = chat.name && chat.phone ? formatPhone(chat.phone) : chat.id;
  const avatar = chat.name.trim() ? chat.name.trim()[0].toUpperCase() : '#';

  return (
    <section className="chat">
      <header className="chat__header">
        <button type="button" className="icon-button chat__back" onClick={onBack}>
          Назад
        </button>
        <span className="chat-item__avatar">{avatar}</span>
        <div className="chat__identity">
          <div className="chat__title">{title}</div>
          <div className="chat__subtitle">{subtitle}</div>
        </div>
      </header>

      {error && (
        <div className="chat__banner">
          <span>{error}</span>
          <button type="button" onClick={onDismissError} aria-label="Скрыть">
            ×
          </button>
        </div>
      )}

      <MessageList messages={messages} />
      <MessageInput onSend={onSend} />
    </section>
  );
}
