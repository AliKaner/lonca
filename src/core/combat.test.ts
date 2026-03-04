import { describe, it, expect } from 'vitest';
import { resolveCombat } from './combat';
import type { Hero, Monster } from './types';

describe('Combat Logic', () => {
  const mockHero: Hero = {
    id: 'hero_1',
    name: 'Test Hero',
    cost: 5,
    baseDice: 2, // 2 dice
    passiveAbility: 'none',
    rank: 'Bronze',
    level: 1,
  };

  const mockMonster: Monster = {
    id: 'monster_1',
    name: 'Test Monster',
    power: 10,
    diceCount: 1, // 1 die
  };

  it('should resolve combat deterministically with same seed', () => {
    const seed = 'test-seed';
    const result1 = resolveCombat([mockHero], mockMonster, seed);
    const result2 = resolveCombat([mockHero], mockMonster, seed);

    expect(result1.playerRolls).toEqual(result2.playerRolls);
    expect(result1.monsterRolls).toEqual(result2.monsterRolls);
    expect(result1.isWin).toEqual(result2.isWin);
  });

  it('should calculate power correctly from rolls', () => {
    const seed = 'test-seed-2';
    const result = resolveCombat([mockHero], mockMonster, seed);
    
    const expectedPlayerPower = result.playerRolls.reduce((a, b) => a + b, 0);
    const expectedMonsterPower = result.monsterRolls.reduce((a, b) => a + b, 0);

    expect(result.playerPower).toBe(expectedPlayerPower);
    expect(result.monsterPower).toBe(expectedMonsterPower);
  });
});
