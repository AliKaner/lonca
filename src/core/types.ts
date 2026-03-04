export const Kingdom = {
  AETHELGARD: 'Aethelgard',
  IRONHOLD: 'Ironhold',
  SHADOWFEN: 'Shadowfen',
  SILVERPINE: 'Silverpine',
  DRAKOS: 'Drakos',
  STORMREACH: 'Stormreach',
  ZANDALAR: 'Zandalar'
} as const;

export type KingdomType = typeof Kingdom[keyof typeof Kingdom];

export type Phase = 'TAVERN' | 'ASSIGNMENT' | 'MISSION' | 'REWARD' | 'END_TURN' | 'GAME_OVER';

export interface Hero {
  id: string;
  name: string;
  cost: number;
  baseDice: number;
  passiveAbility: string;
  kingdomAffinity?: KingdomType;
  image?: string;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Mythic';
  level: number;
}

export interface Monster {
  id: string;
  name: string;
  power: number;
  diceCount: number;
  image?: string;
}

export interface Mission {
  id: string;
  story: string;
  levelRange: [number, number];
  goldReward: number;
  kingdom: KingdomType;
  xp: number;
  monsters: string[]; // IDs of possible monsters
  image?: string;
}

export interface Player {
  id: string;
  name: string;
  gold: number;
  xp: number;
  tokens: Record<string, number>; // kingdom -> count
  heroes: Hero[];
  inventory: string[]; // bonus card IDs
  isAI: boolean;
}

export interface GameLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'INFO' | 'COMBAT' | 'REWARD' | 'ERROR';
}

export interface GameState {
  players: Player[];
  currentTurn: number; // Index of the current player
  phase: Phase;
  missions: Mission[];
  tavern: Hero[];
  seed: string;
  logs: GameLog[];
  activeMission?: {
    missionId: string;
    assignedHeroes: Hero[];
    monster?: Monster;
    playerRolls?: number[];
    monsterRolls?: number[];
    winner?: string; // playerId or 'monster'
  };
}

export type GameAction =
  | { type: 'BUY_HERO'; playerId: string; heroId: string }
  | { type: 'SKIP_TAVERN'; playerId: string }
  | { type: 'ASSIGN_HERO'; playerId: string; missionId: string; heroIds: string[] }
  | { type: 'START_MISSION'; playerId: string }
  | { type: 'RESOLVE_COMBAT'; playerId: string; seed: string }
  | { type: 'APPLY_REWARD'; playerId: string }
  | { type: 'END_TURN'; playerId: string }
  | { type: 'USE_BONUS'; playerId: string; bonusId: string };
