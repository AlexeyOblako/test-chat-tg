import type { Chat, GreenApiCredentials, Message } from '../types';

const CREDENTIALS_KEY = 'max-chat:credentials';
const CHATS_KEY = 'max-chat:chats';
const MESSAGES_KEY = 'max-chat:messages';

export function loadCredentials(): GreenApiCredentials | null {
  return read<GreenApiCredentials>(CREDENTIALS_KEY);
}

export function saveCredentials(credentials: GreenApiCredentials | null): void {
  write(CREDENTIALS_KEY, credentials);
}

export function loadChats(): Chat[] {
  return read<Chat[]>(CHATS_KEY) ?? [];
}

export function saveChats(chats: Chat[]): void {
  write(CHATS_KEY, chats);
}

export function loadMessages(): Message[] {
  return read<Message[]>(MESSAGES_KEY) ?? [];
}

export function saveMessages(messages: Message[]): void {
  write(MESSAGES_KEY, messages);
}

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    return;
  }
}
