import { Hono } from 'hono';
import { getChatroom } from './utils/getChatroom';
import { now } from './utils/now';
import { isOlderThan5Minutes } from './utils/isOlderThan5Minutes';
import { HonoTypes, Message } from './types';
import { getSignature } from './signing';

export const app = new Hono<HonoTypes>({ strict: false })
  .basePath('/chat/v1')
  .use(async (c, next) => {
    const timestamp = c.req.header('X-HubSpot-Request-Timestamp');
    const signatureV2Header = c.req.header('X-HubSpot-Signature');
    const signatureV3Header = c.req.header('X-HubSpot-Signature-V3');

    if (!signatureV2Header || !signatureV3Header) {
      c.status(400);
      return c.body('Bad request. Signature headers missing.');
    }

    if (!timestamp) {
      c.status(400);
      return c.body('Bad request. Timestamp header missing.');
    }

    if (isOlderThan5Minutes(timestamp)) {
      c.status(400);
      return c.body('Bad request. Timestamp is older than 5 minutes.');
    }

    const requestBody = await c.req.text();

    const signatureV2Prod = getSignature({
      method: c.req.method,
      signatureVersion: 'v2',
      url: c.req.url,
      clientSecret: c.env.CLIENT_SECRET!,
      requestBody,
    });

    const signatureV3Prod = getSignature({
      method: c.req.method,
      signatureVersion: 'v3',
      url: c.req.url,
      clientSecret: c.env.CLIENT_SECRET!,
      requestBody,
      timestamp: timestamp ? parseInt(timestamp, 10) : 0,
    });

    const signatureV2Qa = getSignature({
      method: c.req.method,
      signatureVersion: 'v2',
      url: c.req.url,
      clientSecret: c.env.CLIENT_SECRET_QA!,
      requestBody,
    });

    const signatureV3Qa = getSignature({
      method: c.req.method,
      signatureVersion: 'v3',
      url: c.req.url,
      clientSecret: c.env.CLIENT_SECRET_QA!,
      requestBody,
      timestamp: timestamp ? parseInt(timestamp, 10) : 0,
    });

    const validV2Signature = [signatureV2Prod, signatureV2Qa].some(
      (signature) => signature === signatureV2Header
    );

    const validV3Signature = [signatureV3Prod, signatureV3Qa].some(
      (signature) => signature === signatureV3Header
    );

    if (validV2Signature && validV3Signature) {
      return next();
    }

    c.status(401);
    return c.body('Not authorized. Signatures are not valid.');
  })
  .put('/heartbeat', async (c) => {
    const { roomKey, userKey, name } = await c.req.json();
    const roomMembers = JSON.parse((await c.env.PUBLIC_CHAT.get(roomKey)) || '{}');
    const updatedRoom = {
      ...roomMembers,
      [userKey]: {
        name,
        lastSeen: now(),
      },
    };
    await c.env.PUBLIC_CHAT.put(roomKey, JSON.stringify(updatedRoom));
    return c.json(updatedRoom);
  })
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
  });
