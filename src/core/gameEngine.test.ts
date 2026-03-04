import { describe, it, expect } from 'vitest';
import { gameReducer, createInitialState } from './gameEngine';

describe('Game Engine', () => {
  it('should initialize with players', () => {
    const state = createInitialState(['Alice', 'Bob']);
    expect(state.players).toHaveLength(2);
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[1].name).toBe('Bob');
  });

  it('should handle BUY_HERO action', () => {
    const initialState = createInitialState(['Alice']);
    initialState.phase = 'TAVERN';
    initialState.tavern = [{
      id: 'h1', name: 'Hero 1', cost: 7, baseDice: 1, passiveAbility: 'none', rank: 'Bronze', level: 1
    }];
    initialState.players[0].gold = 10;

    const action = { type: 'BUY_HERO' as const, playerId: 'player_0', heroId: 'h1' };
    const nextState = gameReducer(initialState, action);

    expect(nextState.players[0].gold).toBe(3);
    expect(nextState.players[0].heroes).toHaveLength(1);
    expect(nextState.players[0].heroes[0].id).toBe('h1');
    expect(nextState.phase).toBe('ASSIGNMENT');
  });

  it('should validate gold when buying hero', () => {
    const initialState = createInitialState(['Alice']);
    initialState.phase = 'TAVERN';
    initialState.tavern = [{
      id: 'h1', name: 'Hero 1', cost: 11, baseDice: 1, passiveAbility: 'none', rank: 'Bronze', level: 1
    }];
    initialState.players[0].gold = 10;

    const action = { type: 'BUY_HERO' as const, playerId: 'player_0', heroId: 'h1' };
    const nextState = gameReducer(initialState, action);

    expect(nextState.players[0].gold).toBe(10);
    expect(nextState.players[0].heroes).toHaveLength(0);
  });
});
