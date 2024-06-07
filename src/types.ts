import { Chatroom } from './Chatroom';

export type Bindings = {
  CHATROOM: DurableObjectNamespace<Chatroom>;
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
