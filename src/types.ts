import { Chatroom } from './Chatroom';

export type Bindings = {
  CHATROOM: DurableObjectNamespace<Chatroom>;
  PUBLIC_CHAT: KVNamespace;
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
