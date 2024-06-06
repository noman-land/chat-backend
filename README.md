# chat-backend

## Endpoints

All endpoints have no auth and are fully public.

### GET `/chat/v1/rooms/:roomId`

Returns the last 100 messages in the chatroom. There is no authentication and all channels are public.

### POST `/chat/v1/rooms/:roomId`

Sends a new message into the chatroom. Returns the last 100 messages with the new message included.

The `POST` body is a single `Message` in JSON.

```ts
interface Message {
  author: string;
  message: string;
}
```
