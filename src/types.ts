import { Chatroom } from './Chatroom';

export type Bindings = {
  CHATROOM: DurableObjectNamespace<Chatroom>;
  PUBLIC_CHAT: KVNamespace;
  CLIENT_SECRET: string;
  CLIENT_SECRET_QA: string;
};

export interface HonoTypes {
  Bindings: Bindings;
}

export interface Message {
  author: string;
  message: string;
}

export interface TimestampedMessage extends Message {
  timestamp: number;
}
