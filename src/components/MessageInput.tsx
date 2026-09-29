import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';

const MAX_LENGTH = 4000;

interface MessageInputProps {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    const text = value.trim();
    if (!text) {
      return;
    }
    onSend(text);
    setValue('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        className="composer__input"
        value={value}
        onChange={(event) => setValue(event.target.value.slice(0, MAX_LENGTH))}
        onKeyDown={handleKeyDown}
        placeholder="Напишите сообщение"
        rows={1}
      />
      <button type="submit" className="button button--send" disabled={!value.trim()}>
        Отправить
      </button>
    </form>
  );
}
