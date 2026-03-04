import type { GameAction, GameState, Hero, Player, Mission, Monster } from './types';
import heroesData from '../data/heroes.json';
import missionsData from '../data/missions.json';
import monstersData from '../data/monsters.json';
import { resolveCombat } from './combat';
import { nanoid } from 'nanoid';

const INITIAL_PLAYER_GOLD = 10;

const getRandomHero = (minCost = 7, maxCost?: number): Hero => {
  const heroes = heroesData as Hero[];
  const candidates = heroes.filter(h => {
    const costMatch = h.cost >= minCost && (!maxCost || h.cost <= maxCost);
    return costMatch;
  });
  // Fallback to all heroes if no candidates found (unlikely)
  const source = candidates.length > 0 ? candidates : heroes;
  const hero = source[Math.floor(Math.random() * source.length)];
  return { ...hero, id: nanoid() };
};

const getRandomMission = (): Mission => {
  const missions = missionsData as Mission[];
  const mission = missions[Math.floor(Math.random() * missions.length)];
  return { ...mission, id: nanoid() };
};

const checkWinCondition = (player: Player): boolean => {
  // Win Condition: 6 tokens from the same kingdom OR 8 total tokens from different kingdoms
  const tokenCounts = Object.values(player.tokens);
  const sameKingdomWin = tokenCounts.some(count => count >= 6);
  const totalKingdomsWin = Object.keys(player.tokens).length >= 8;
  return sameKingdomWin || totalKingdomsWin;
};

export const createInitialState = (playerNames: string[]): GameState => {
  const players: Player[] = playerNames.map((name, index) => ({
    id: `player_${index}`,
    name,
    gold: INITIAL_PLAYER_GOLD,
    xp: 0,
    tokens: {},
    heroes: [],
    inventory: [],
    isAI: index > 0,
  }));

  // Ensure first turn heroes are affordable (<= 10 gold) and at least 7 gold
  const initialTavern = Array.from({ length: 3 }, () => getRandomHero(7, 10));
  const initialMissions = Array.from({ length: 6 }, getRandomMission);

  return {
    players,
    currentTurn: 0,
    phase: 'TAVERN',
    missions: initialMissions,
    tavern: initialTavern,
    seed: nanoid(),
    logs: [{ id: nanoid(), timestamp: Date.now(), message: 'Welcome to the Seven Kingdoms!', type: 'INFO' }],
  };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  const currentPlayer = state.players[state.currentTurn];

  switch (action.type) {
    case 'BUY_HERO': {
      if (state.phase !== 'TAVERN') return state;
      const hero = state.tavern.find((h) => h.id === action.heroId);
      if (!hero || currentPlayer.gold < hero.cost) return state;

      const newPlayers = [...state.players];
      // Hero cost scaling by level could be here, but current design uses fixed costs
      newPlayers[state.currentTurn] = {
        ...currentPlayer,
        gold: currentPlayer.gold - hero.cost,
        heroes: [...currentPlayer.heroes, hero],
      };

      // Ensure tavern is full
      const nextTavern = state.tavern.filter((h) => h.id !== action.heroId);
      while (nextTavern.length < 3) {
        nextTavern.push(getRandomHero());
      }

      return {
        ...state,
        players: newPlayers,
        tavern: nextTavern,
        phase: 'ASSIGNMENT',
        logs: [...state.logs, { id: nanoid(), timestamp: Date.now(), message: `${currentPlayer.name} recruited ${hero.name}`, type: 'INFO' }],
      };
    }

    case 'SKIP_TAVERN': {
      if (state.phase !== 'TAVERN') return state;
      return {
        ...state,
        phase: 'ASSIGNMENT',
        logs: [...state.logs, { id: nanoid(), timestamp: Date.now(), message: `${currentPlayer.name} skipped the tavern`, type: 'INFO' }],
      };
    }

    case 'ASSIGN_HERO': {
      if (state.phase !== 'ASSIGNMENT') return state;
      const mission = state.missions.find((m) => m.id === action.missionId);
      const assignedHeroes = currentPlayer.heroes.filter((h) => action.heroIds.includes(h.id));

      if (!mission || assignedHeroes.length === 0) return state;

      return {
        ...state,
        activeMission: {
          missionId: action.missionId,
          assignedHeroes,
        },
        phase: 'MISSION',
        logs: [...state.logs, { id: nanoid(), timestamp: Date.now(), message: `${currentPlayer.name} started discovery: ${mission.kingdom}`, type: 'INFO' }],
      };
    }

    case 'START_MISSION': {
      if (state.phase !== 'MISSION' || !state.activeMission) return state;
      const mission = state.missions.find((m) => m.id === state.activeMission!.missionId)!;
      const monsterId = mission.monsters[Math.floor(Math.random() * mission.monsters.length)];
      const monster = (monstersData as Monster[]).find(m => m.id === monsterId)!;

      return {
        ...state,
        activeMission: {
          ...state.activeMission,
          monster,
        }
      };
    }

    case 'RESOLVE_COMBAT': {
      if (!state.activeMission || !state.activeMission.monster) return state;
      const result = resolveCombat(
        state.activeMission.assignedHeroes,
        state.activeMission.monster,
        state.seed + state.currentTurn + state.activeMission.missionId
      );

      return {
        ...state,
        activeMission: {
          ...state.activeMission,
          playerRolls: result.playerRolls,
          monsterRolls: result.monsterRolls,
          winner: result.isWin ? currentPlayer.id : 'monster',
        },
        phase: 'REWARD',
        logs: [...state.logs, { 
          id: nanoid(), 
          timestamp: Date.now(), 
          message: result.isWin ? `${currentPlayer.name} conquered the ${state.activeMission.monster.name}!` : `Heroes fell at the hands of ${state.activeMission.monster.name}`, 
          type: 'COMBAT' 
        }],
      };
    }

    case 'APPLY_REWARD': {
      if (state.phase !== 'REWARD' || !state.activeMission) return state;
      const mission = state.missions.find(m => m.id === state.activeMission!.missionId)!;
      const isWin = state.activeMission.winner === currentPlayer.id;
      
      let newPlayers = [...state.players];
      let player = { ...currentPlayer };

      if (isWin) {
        player.gold += mission.goldReward;
        player.xp += mission.xp;
        player.tokens[mission.kingdom] = (player.tokens[mission.kingdom] || 0) + 1;
        
        player.heroes = player.heroes.map(h => {
          if (state.activeMission?.assignedHeroes.find(ah => ah.id === h.id)) {
            return { ...h, level: h.level + 1, cost: h.cost + 2 };
          }
          return h;
        });
      } else {
        player.heroes = player.heroes.filter(h => !state.activeMission!.assignedHeroes.find(ah => ah.id === h.id));
      }

      newPlayers[state.currentTurn] = player;

      // Ensure missions are full
      const nextMissions = state.missions.filter(m => m.id !== mission.id);
      while (nextMissions.length < 6) {
        nextMissions.push(getRandomMission());
      }

      const isGameOver = checkWinCondition(player);

      return {
        ...state,
        players: newPlayers,
        missions: nextMissions,
        activeMission: undefined,
        phase: isGameOver ? 'GAME_OVER' : 'END_TURN',
        logs: [
          ...state.logs, 
          isGameOver ? { id: nanoid(), timestamp: Date.now(), message: `🏆 ${player.name} HAS CONQUERED THE SEVEN KINGDOMS!`, type: 'INFO' } : null
        ].filter(Boolean) as any[],
      };
    }

    case 'END_TURN': {
      const nextTurn = (state.currentTurn + 1) % state.players.length;
      return {
        ...state,
        currentTurn: nextTurn,
        phase: 'TAVERN',
        seed: nanoid(),
      };
    }

    default:
      return state;
  }
};
