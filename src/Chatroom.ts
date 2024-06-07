import { DurableObject } from 'cloudflare:workers';
import { TimestampedMessage } from './types';

export class Chatroom extends DurableObject {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.env = env;
  }

  async getMessages() {
    const messages = (await this.state.storage.get<TimestampedMessage[]>('messages')) || [];
    return { messages };
  }

  async sendMessage(message: TimestampedMessage) {
    const latestMessages = (await this.state.storage.get<TimestampedMessage[]>('messages')) || [];
    latestMessages.push(message);
    const messages = latestMessages.slice(-100);
    await this.state.storage.put('messages', messages);
    return { messages };
  }
}
