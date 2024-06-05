import { Context } from 'hono';
import { Bindings } from '../types';

export const getChatroom = (c: Context<{ Bindings: Bindings }>) => {
  const { name } = c.req.param();
  const id = c.env.CHATROOM.idFromName(name);
  const chatroom = c.env.CHATROOM.get(id);
  return chatroom;
};
