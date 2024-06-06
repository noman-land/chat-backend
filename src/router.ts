import { Hono } from 'hono/tiny';
import { getChatroom } from './utils/getChatroom';
import { Bindings } from './types';

interface HonoTypes {
  Bindings: Bindings;
}

export const app = new Hono<HonoTypes>({ strict: false })
  .basePath('/chat/v1')
  .get('/rooms/:name', async (c) => {
    const chatroom = getChatroom(c);
    const { messages } = await chatroom.getMessages();
    return c.json({ messages });
  })
  .post('/rooms/:name', async (c) => {
    const chatroom = getChatroom(c);
    const { author, message } = await c.req.json();
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
