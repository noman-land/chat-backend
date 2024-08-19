import { Hono } from 'hono';
import { getChatroom } from './utils/getChatroom';
import { now } from './utils/now';
import { isOlderThan5Minutes } from './utils/isOlderThan5Minutes';
import { HonoTypes, Message } from './types';
import { getSignature } from './signing';

export const app = new Hono<HonoTypes>({ strict: false })
  .basePath('/chat/v1')
  .use(async (c, next) => {
    /***********************************************************
     *                                                         *
     *                    VERIFY SIGNATURES                    *
     *                                                         *
     ***********************************************************/

    const signatureV2Header = c.req.header('X-HubSpot-Signature');
    const signatureV3Header = c.req.header('X-HubSpot-Signature-V3');

    /**
     * If there are no signatures attached, it is not allowed
     */
    if (!signatureV2Header || !signatureV3Header) {
      c.status(400);
      return c.body('Bad request. Signature headers missing.');
    }

    const timestampHeader = c.req.header('X-HubSpot-Request-Timestamp');

    /**
     * [Only for v3] If there is no timestamp attached, it is not allowed
     */
    if (!timestampHeader) {
      c.status(400);
      return c.body('Bad request. Timestamp header missing.');
    }

    const timestamp = parseInt(timestampHeader, 10);

    /**
     * [Only for v3] If the timestamp is older than 5 minutes, it is not allowed
     */
    if (isOlderThan5Minutes(timestamp)) {
      c.status(400);
      return c.body('Bad request. Timestamp is older than 5 minutes.');
    }

    /**
     * Stringify the request body
     */
    const body = await c.req.text();
    const requestBody = body === undefined || body === null ? '' : body;

    const options = {
      method: c.req.method,
      url: c.req.url,
      requestBody,
    };

    /**
     * Generate signatures
     */
    const signatureV2Prod = getSignature({
      ...options,
      signatureVersion: 'v2',
      clientSecret: c.env.CLIENT_SECRET!,
    });

    const signatureV3Prod = getSignature({
      ...options,
      signatureVersion: 'v3',
      clientSecret: c.env.CLIENT_SECRET!,
      timestamp,
    });

    const signatureV2Qa = getSignature({
      ...options,
      signatureVersion: 'v2',
      clientSecret: c.env.CLIENT_SECRET_QA!,
    });

    const signatureV3Qa = getSignature({
      ...options,
      signatureVersion: 'v3',
      clientSecret: c.env.CLIENT_SECRET_QA!,
      timestamp,
    });

    /**
     * Match signatures against ones sent in headers
     */
    const validV2Signature = [signatureV2Prod, signatureV2Qa].some(
      (signature) => signature === signatureV2Header
    );

    const validV3Signature = [signatureV3Prod, signatureV3Qa].some(
      (signature) => signature === signatureV3Header
    );

    const traceparent = c.req.header('Traceparent') || '';

    console.log({
      ...options,
      timestamp,
      signatureV2Header,
      signatureV3Header,
      validV2Signature,
      validV3Signature,
      traceparent,
    });

    /**
     * Proceed only if signatures are valid
     */
    if (validV2Signature && validV3Signature) {
      return next();
    }

    /**
     * Everything else is unauthorized
     */
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
  })
  .put('/heartbeat-2', async (c) => {
    return c.redirect('/heartbeat');
  });
