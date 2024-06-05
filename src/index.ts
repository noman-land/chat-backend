import { Hono } from 'hono';
import { getChatroom } from './utils/getChatroom';
import { Bindings } from './types';

export { Chatroom } from './Chatroom';

const app = new Hono<{ Bindings: Bindings }>().basePath('/chat/v1');

app.get('/rooms/:name', async (c) => {
  const chatroom = getChatroom(c);
  const { messages } = await chatroom.getMessages();
  return c.json({ messages });
});

app.post('/rooms/:name', async (c) => {
  const chatroom = getChatroom(c);
  const { author, message } = await c.req.json();
  const { messages } = await chatroom.sendMessage({
    author,
    message,
    timestamp: new Date().getTime(),
  });
  return c.json({ messages });
});

app.all('*', (c) => {
  return c.text('Not Founde', 404);
});

export default app;
