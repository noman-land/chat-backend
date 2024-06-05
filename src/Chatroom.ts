import { DurableObject } from 'cloudflare:workers';

type Message = {
  author: string;
  message: string;
  timestamp: number;
};

export class Chatroom extends DurableObject {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.env = env;
  }

  async getMessages() {
    const messages = (await this.state.storage.get<Message[]>('messages')) || [];
    return { messages };
  }

  async sendMessage(message: Message) {
    const latestMessages = (await this.state.storage.get<Message[]>('messages')) || [];
    latestMessages.push(message);
    const messages = latestMessages.slice(-100);
    await this.state.storage.put('messages', messages);
    return { messages };
  }
}
