import type { GameAction, GameState, Player } from '../core/types';
import type { Message } from './protocol';
import { createInitialState, gameReducer } from '../core/gameEngine';

export class MockServer {
  private state: GameState;
  private handlers: ((msg: Message) => void)[] = [];
  private latency: number = 200;

  constructor() {
    this.state = createInitialState(['Player 1', 'AI Knight', 'AI Wizard']);
  }

  public onMessage(handler: (msg: Message) => void) {
    this.handlers.push(handler);
    // Send current state to the new client immediately
    handler({ type: 'STATE_UPDATE', state: this.state });
  }

  public send(msg: Message) {
    if (msg.type === 'ACTION') {
      setTimeout(() => this.processAction(msg.action, msg.playerId), this.latency);
    }
  }

  private processAction(action: GameAction, playerId: string) {
    // Basic validation: ensure it's the player's turn
    const currentPlayer = this.state.players[this.state.currentTurn];
    if (currentPlayer.id !== playerId) {
      this.broadcast({ type: 'ERROR', message: "It's not your turn!" });
      return;
    }

    try {
      this.state = gameReducer(this.state, action);
      this.broadcast({ type: 'STATE_UPDATE', state: this.state });

      // Handle AI turns if necessary
      this.checkAITurn();
    } catch (e) {
      this.broadcast({ type: 'ERROR', message: "Invalid action" });
    }
  }

  private broadcast(msg: Message) {
    this.handlers.forEach(h => h(msg));
  }

  private checkAITurn() {
    const player = this.state.players[this.state.currentTurn];
    if (player.isAI) {
      setTimeout(() => this.simulateAITurn(player), 1000);
    }
  }

  private simulateAITurn(player: Player) {
    // Simple AI: Buy first affordable hero, or pass
    if (this.state.phase === 'TAVERN') {
      const affordableHero = this.state.tavern.find(h => h.cost <= player.gold);
      if (affordableHero) {
        this.processAction({ type: 'BUY_HERO', playerId: player.id, heroId: affordableHero.id }, player.id);
      } else {
        // Skip buy
        this.broadcast({ type: 'STATE_UPDATE', state: { ...this.state, phase: 'ASSIGNMENT' } });
        this.state = { ...this.state, phase: 'ASSIGNMENT' };
        this.checkAITurn();
      }
    } else if (this.state.phase === 'ASSIGNMENT') {
       // Just pick the first mission and first hero
       if (player.heroes.length > 0) {
         this.processAction({ type: 'ASSIGN_HERO', playerId: player.id, missionId: this.state.missions[0].id, heroIds: [player.heroes[0].id] }, player.id);
       } else {
         // No heroes, skip to end turn
         this.state = { ...this.state, phase: 'END_TURN' };
         this.broadcast({ type: 'STATE_UPDATE', state: this.state });
         this.checkAITurn();
       }
    } else if (this.state.phase === 'MISSION') {
       this.processAction({ type: 'START_MISSION', playerId: player.id }, player.id);
    } else if (this.state.phase === 'REWARD') {
       this.processAction({ type: 'APPLY_REWARD', playerId: player.id }, player.id);
    } else if (this.state.phase === 'END_TURN') {
       this.processAction({ type: 'END_TURN', playerId: player.id }, player.id);
    }
  }

  public getInitialState(): GameState {
    return this.state;
  }
}

export const mockServer = new MockServer();
