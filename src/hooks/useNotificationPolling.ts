import { useEffect, useRef } from 'react';
import { deleteNotification, receiveNotification } from '../api/greenApi';
import type { GreenApiCredentials, NotificationBody } from '../types';

const RETRY_DELAY = 3000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useNotificationPolling(
  credentials: GreenApiCredentials | null,
  onNotification: (body: NotificationBody) => void,
  onError: (message: string) => void,
): void {
  const notificationRef = useRef(onNotification);
  const errorRef = useRef(onError);

  notificationRef.current = onNotification;
  errorRef.current = onError;

  useEffect(() => {
    if (!credentials) {
      return;
    }

    let stopped = false;

    const poll = async () => {
      while (!stopped) {
        try {
          const notification = await receiveNotification(credentials);
          if (stopped) {
            return;
          }
          if (!notification) {
            continue;
          }
          await deleteNotification(credentials, notification.receiptId);
          if (stopped) {
            return;
          }
          notificationRef.current(notification.body);
        } catch (error) {
          if (stopped) {
            return;
          }
          errorRef.current(error instanceof Error ? error.message : 'Не удалось получить уведомление');
          await delay(RETRY_DELAY);
        }
      }
    };

    void poll();

    return () => {
      stopped = true;
    };
  }, [credentials]);
}
