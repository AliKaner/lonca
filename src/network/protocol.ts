import type { GameAction, GameState } from '../core/types';

export type Message =
  | { type: 'ACTION'; playerId: string; action: GameAction; turn: number }
  | { type: 'STATE_UPDATE'; state: GameState }
  | { type: 'ERROR'; message: string };

export interface ISocketClient {
  send: (message: Message) => void;
  onMessage: (handler: (message: Message) => void) => void;
  connect: (url: string) => Promise<void>;
}
