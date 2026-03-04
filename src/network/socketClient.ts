import type { GameAction } from '../core/types';
import type { Message, ISocketClient } from './protocol';
import { mockServer } from './mockServer';

export class SocketClient implements ISocketClient {
  private handlers: ((msg: Message) => void)[] = [];
  private playerId: string;

  constructor(playerId: string) {
    this.playerId = playerId;
    mockServer.onMessage((msg) => this.handleMessage(msg));
  }

  public async connect(_url: string): Promise<void> {
    // In mock mode, connection is immediate
    console.log(`Connected to mock server as ${this.playerId}`);
  }

  public send(msg: Message) {
    mockServer.send(msg);
  }

  public sendAction(action: GameAction) {
    this.send({ type: 'ACTION', playerId: this.playerId, action, turn: 0 });
  }

  public onMessage(handler: (msg: Message) => void) {
    this.handlers.push(handler);
  }

  private handleMessage(msg: Message) {
    this.handlers.forEach(h => h(msg));
  }
}
