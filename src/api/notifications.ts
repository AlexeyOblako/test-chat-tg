import type { NotificationBody, IncomingText } from '../types';

export function parseIncomingText(body: NotificationBody): IncomingText | null {
  if (body.typeWebhook !== 'incomingMessageReceived') {
    return null;
  }

  const type = body.messageData?.typeMessage;
  if (type !== 'textMessage' && type !== 'extendedTextMessage') {
    return null;
  }

  const text = body.messageData?.textMessageData?.textMessage;
  const chatId = body.senderData?.chatId;

  if (!text || !chatId) {
    return null;
  }

  const phone = body.senderData?.senderPhoneNumber ? String(body.senderData.senderPhoneNumber) : '';

  return {
    idMessage: body.idMessage ?? `${chatId}:${body.timestamp ?? Date.now()}`,
    chatId,
    senderName: body.senderData?.chatName || body.senderData?.senderName || '',
    phone,
    text,
    timestamp: body.timestamp ? body.timestamp * 1000 : Date.now(),
  };
}
