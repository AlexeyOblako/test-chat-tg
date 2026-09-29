import http from 'node:http';

const PORT = 8787;
const queue = [];
const waiters = [];
let counter = 0;

function nextId(prefix) {
  counter += 1;
  return `${prefix}${Date.now()}${counter}`;
}

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  });
  res.end(data === null ? 'null' : JSON.stringify(data));
}

function notify(body) {
  const item = { receiptId: nextId('r'), body };
  if (waiters.length > 0) {
    waiters.shift()(item);
    return;
  }
  queue.push(item);
}

function parseBody(raw) {
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 200, null);
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const match = url.pathname.match(/^\/waInstance(\w+)\/([a-zA-Z]+)\/(.+)$/);

  if (!match) {
    send(res, 404, { error: 'unknown path' });
    return;
  }

  const method = match[2];

  if (method === 'getStateInstance') {
    send(res, 200, { stateInstance: 'authorized' });
    return;
  }

  if (method === 'setSettings') {
    send(res, 200, { result: true });
    return;
  }

  if (method === 'deleteNotification') {
    send(res, 200, { result: true });
    return;
  }

  if (method === 'checkAccount') {
    send(res, 200, { exist: true, chatId: '10000001', fromCache: false });
    return;
  }

  if (method === 'sendMessage') {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const { chatId, message } = parseBody(Buffer.concat(chunks).toString('utf8'));
      send(res, 200, { idMessage: nextId('mock') });

      setTimeout(() => {
        notify({
          typeWebhook: 'incomingMessageReceived',
          instanceData: { idInstance: 1101000000, wid: '79991234567@c.us', typeInstance: 'v3' },
          timestamp: Math.floor(Date.now() / 1000),
          idMessage: nextId('in'),
          senderData: {
            chatId,
            chatName: 'Тестовый собеседник',
            chatType: 'user',
            sender: chatId,
            senderName: 'Тестовый собеседник',
            senderType: 'user',
            senderContactName: '',
            senderPhoneNumber: 79991234567,
          },
          messageData: {
            typeMessage: 'textMessage',
            textMessageData: { textMessage: `Эхо: ${message}` },
          },
        });
      }, 1200);
    });
    return;
  }

  if (method === 'receiveNotification') {
    if (queue.length > 0) {
      send(res, 200, queue.shift());
      return;
    }

    const waiter = (item) => {
      clearTimeout(timer);
      send(res, 200, item);
    };
    const timer = setTimeout(() => {
      const index = waiters.indexOf(waiter);
      if (index >= 0) {
        waiters.splice(index, 1);
      }
      send(res, 200, null);
    }, 5000);

    waiters.push(waiter);
    return;
  }

  send(res, 404, { error: `unknown method ${method}` });
});

server.listen(PORT, () => {
  console.log(`GREEN-API mock listening on http://localhost:${PORT}`);
});
