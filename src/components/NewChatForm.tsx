import { useState } from 'react';
import type { FormEvent } from 'react';

interface NewChatFormProps {
  creating: boolean;
  error: string;
  onCreate: (phone: string) => void;
}

export default function NewChatForm({ creating, error, onCreate }: NewChatFormProps) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!phone.trim() || creating) {
      return;
    }
    onCreate(phone);
  };

  return (
    <form className="new-chat" onSubmit={handleSubmit}>
      <input
        className="field__input new-chat__input"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="+7 999 123-45-67"
        inputMode="tel"
        disabled={creating}
      />
      <button type="submit" className="button button--small" disabled={creating || !phone.trim()}>
        {creating ? 'Проверяем…' : 'Создать чат'}
      </button>
      {error && <p className="new-chat__error">{error}</p>}
    </form>
  );
}
