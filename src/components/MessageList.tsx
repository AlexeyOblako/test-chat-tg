import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { formatTime } from '../utils/time';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  return (
    <div className="messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.outgoing ? 'message--out' : 'message--in'}`}
        >
          <div className="message__bubble">
            <span className="message__text">{message.text}</span>
            <span className="message__meta">
              <span className="message__time">{formatTime(message.timestamp)}</span>
              {message.outgoing && (
                <span
                  className={`message__status message__status--${message.status}`}
                  title={statusTitle(message.status)}
                />
              )}
            </span>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

function statusTitle(status: Message['status']): string {
  if (status === 'pending') {
    return 'Отправляется';
  }
  if (status === 'failed') {
    return 'Не отправлено';
  }
  return 'Отправлено';
}
