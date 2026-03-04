import { create } from 'zustand';
import type { GameAction, GameState } from '../core/types';
import { createInitialState, gameReducer } from '../core/gameEngine';

interface GameStore {
  state: GameState;
  dispatch: (action: GameAction) => void;
  initialize: (playerNames: string[]) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  state: createInitialState(['Player 1', 'AI Overlord']), // Default for now
  dispatch: (action: GameAction) => 
    set((s) => ({
      state: gameReducer(s.state, action),
    })),
  initialize: (playerNames: string[]) => 
    set(() => ({
      state: createInitialState(playerNames),
    })),
}));
