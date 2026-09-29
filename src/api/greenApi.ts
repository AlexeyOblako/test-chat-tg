import type { GreenApiCredentials, Notification } from '../types';

interface AccountCheck {
  exist: boolean;
  chatId: string;
}

function requestUrl(credentials: GreenApiCredentials, path: string): string {
  const apiUrl = credentials.apiUrl.trim().replace(/\/+$/, '');
  const idInstance = credentials.idInstance.trim();
  const token = credentials.apiTokenInstance.trim();
  return `${apiUrl}/waInstance${idInstance}/${path}/${token}`;
}

async function call<T>(
  credentials: GreenApiCredentials,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(requestUrl(credentials, path), {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const data = text ? parse(text) : null;

  if (!response.ok) {
    throw new Error(readError(data, response.status));
  }

  return data as T;
}

function parse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function readError(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message) {
      return message;
    }
  }
  if (typeof data === 'string' && data) {
    return data;
  }
  return `Ошибка запроса (${status})`;
}

export async function getStateInstance(credentials: GreenApiCredentials): Promise<string> {
  const data = await call<{ stateInstance: string }>(credentials, 'GET', 'getStateInstance');
  return data.stateInstance;
}

export async function setSettings(credentials: GreenApiCredentials): Promise<void> {
  await call(credentials, 'POST', 'setSettings', {
    webhookUrl: '',
    incomingWebhook: 'yes',
    outgoingWebhook: 'no',
    stateWebhook: 'no',
  });
}

export async function checkAccount(credentials: GreenApiCredentials, phoneNumber: number): Promise<AccountCheck> {
  return call<AccountCheck>(credentials, 'POST', 'checkAccount', { phoneNumber });
}

export async function sendMessage(credentials: GreenApiCredentials, chatId: string, text: string): Promise<string> {
  const data = await call<{ idMessage: string }>(credentials, 'POST', 'sendMessage', {
    chatId,
    message: text,
  });
  return data.idMessage;
}

export async function receiveNotification(credentials: GreenApiCredentials): Promise<Notification | null> {
  const data = await call<Notification | null>(credentials, 'GET', 'receiveNotification');
  return data ?? null;
}

export async function deleteNotification(credentials: GreenApiCredentials, receiptId: number): Promise<void> {
  await call(credentials, 'DELETE', `deleteNotification/${receiptId}`);
}
