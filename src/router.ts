import { Hono } from 'hono';
import { getChatroom } from './utils/getChatroom';
import { HonoTypes, Message } from './types';

export const app = new Hono<HonoTypes>({ strict: false })
  .basePath('/chat/v1')
  .get('/rooms/:name', async (c) => {
    const chatroom = getChatroom(c);
    const { messages } = await chatroom.getMessages();
    return c.json({ messages });
  })
  .post('/rooms/:name', async (c) => {
    const chatroom = getChatroom(c);
    const { author, message } = await c.req.json<Message>();
    const { messages } = await chatroom.sendMessage({
      author,
      message,
      timestamp: new Date().getTime(),
    });
    return c.json({ messages });
  })
  .all('*', (c) => {
    return c.text('Not Founde', 404);
  });
