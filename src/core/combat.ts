import type { Hero, Monster } from './types';
import { createRNG, rollDice } from '../utils/rng';

export interface CombatResult {
  playerRolls: number[];
  monsterRolls: number[];
  playerPower: number;
  monsterPower: number;
  isWin: boolean;
}

export const resolveCombat = (
  heroes: Hero[],
  monster: Monster,
  seed: string
): CombatResult => {
  const rng = createRNG(seed);

  // Total dice for the player = sum of hero base dice
  const totalHeroDice = heroes.reduce((sum, h) => sum + h.baseDice, 0);
  const playerRolls = rollDice(rng, totalHeroDice);
  const playerPower = playerRolls.reduce((sum, r) => sum + r, 0);

  // Monster power is based on its dice count
  const monsterRolls = rollDice(rng, monster.diceCount);
  const monsterPower = monsterRolls.reduce((sum, r) => sum + r, 0);

  // Requirement: if playerPower >= monsterPower -> win
  return {
    playerRolls,
    monsterRolls,
    playerPower,
    monsterPower,
    isWin: playerPower >= monsterPower,
  };
};
