# chat-backend

## Endpoints

All endpoints have no auth and are fully public.

### GET `/chat/v1/rooms/:roomId`

Returns the last 100 messages in the chatroom.

### POST `/chat/v1/rooms/:roomId`

Sends a new message into the chatroom. Returns the last 100 messages with the new message included. All previous messages are discarded.

The `POST` body is a single `Message` in JSON.

```ts
interface Message {
  author: string;
  message: string;
}
```

## Running locally

`npm start`

Example local url: [http://localhost:9997/chat/v1/rooms/123](http://localhost:9997/chat/v1/rooms/123)

## Deploying

### Automatic deploy

This service auto deploys to Cloudflare on merge to `master`. It uses Workers and Durable Objects (paid plan).

You will need a `DOMAIN` and a `CLOUDFLARE_API_TOKEN` repository secret created in the settings of the repo. They are used in the [Github Action](./.github/workflows/main.yml).

### Manual deploy

`npm run deploy`

**Note**: You will need to create a real `wrangler.toml` file using [`wrangler-example.toml`](./wrangler-example.toml) as an example.
