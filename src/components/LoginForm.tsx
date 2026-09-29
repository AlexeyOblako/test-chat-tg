import { useState } from 'react';
import type { FormEvent } from 'react';
import type { GreenApiCredentials } from '../types';

interface LoginFormProps {
  initial: GreenApiCredentials | null;
  defaultApiUrl: string;
  loading: boolean;
  error: string;
  onSubmit: (credentials: GreenApiCredentials) => void;
}

export default function LoginForm({ initial, defaultApiUrl, loading, error, onSubmit }: LoginFormProps) {
  const [idInstance, setIdInstance] = useState(initial?.idInstance ?? '');
  const [apiTokenInstance, setApiTokenInstance] = useState(initial?.apiTokenInstance ?? '');
  const [apiUrl, setApiUrl] = useState(initial?.apiUrl ?? defaultApiUrl);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filled = idInstance.trim() !== '' && apiTokenInstance.trim() !== '' && apiUrl.trim() !== '';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!filled || loading) {
      return;
    }
    onSubmit({
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim(),
    });
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__brand">
          <span className="logo">MAX</span>
          <span className="logo__note">чат через GREEN-API</span>
        </div>

        <label className="field">
          <span className="field__label">idInstance</span>
          <input
            className="field__input"
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            placeholder="1101000000"
            autoComplete="off"
            inputMode="numeric"
          />
        </label>

        <label className="field">
          <span className="field__label">apiTokenInstance</span>
          <input
            className="field__input"
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd45"
            autoComplete="off"
          />
        </label>

        <button type="button" className="link" onClick={() => setShowAdvanced((value) => !value)}>
          {showAdvanced ? 'Скрыть адрес API' : 'Изменить адрес API'}
        </button>

        {showAdvanced && (
          <label className="field">
            <span className="field__label">apiUrl</span>
            <input
              className="field__input"
              value={apiUrl}
              onChange={(event) => setApiUrl(event.target.value)}
              autoComplete="off"
            />
          </label>
        )}

        {error && <p className="login__error">{error}</p>}

        <button type="submit" className="button" disabled={!filled || loading}>
          {loading ? 'Подключаемся…' : 'Войти'}
        </button>

        <p className="login__hint">
          idInstance и apiTokenInstance находятся в личном кабинете GREEN-API. Чтобы получать ответы,
          инстанс должен быть авторизован в MAX.
        </p>
      </form>
    </div>
  );
}
