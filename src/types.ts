export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl: string;
}

export interface Chat {
  id: string;
  phone: string;
  name: string;
}

export type MessageStatus = 'pending' | 'sent' | 'failed';

export interface Message {
  id: string;
  chatId: string;
  text: string;
  outgoing: boolean;
  timestamp: number;
  status: MessageStatus;
}

export interface NotificationBody {
  typeWebhook: string;
  idMessage?: string;
  timestamp?: number;
  senderData?: {
    chatId?: string;
    chatName?: string;
    senderName?: string;
    senderPhoneNumber?: number;
  };
  messageData?: {
    typeMessage?: string;
    textMessageData?: {
      textMessage?: string;
    };
  };
}

export interface Notification {
  receiptId: number;
  body: NotificationBody;
}

export interface IncomingText {
  idMessage: string;
  chatId: string;
  senderName: string;
  phone: string;
  text: string;
  timestamp: number;
}
