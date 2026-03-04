import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Shield, Award } from 'lucide-react';

export const PlayerPanel: React.FC = () => {
  const { state } = useGameStore();

  return (
    <div className="player-panel-container glass-panel p-4 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Award className="text-gold h-5 w-5" /> Guild Leaders
      </h3>
      <div className="flex flex-col gap-3">
        {state.players.map((player) => (
          <div 
            key={player.id} 
            className={`p-3 rounded-lg border transition-all ${
              state.players[state.currentTurn].id === player.id 
                ? 'border-gold bg-gold/10 scale-105 shadow-[0_0_15px_rgba(255,215,0,0.2)]' 
                : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`font-bold ${player.isAI ? 'text-dim' : 'text-white'}`}>
                {player.name} {player.isAI && '(AI)'}
              </span>
              <span className="text-xs text-gold">{player.gold}G</span>
            </div>
            
            <div className="flex gap-1 flex-wrap mt-2">
              {Object.entries(player.tokens).map(([kingdom, count]) => (
                <div 
                  key={kingdom} 
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 border border-white/20 flex items-center gap-1"
                  title={`${kingdom} Tokens`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  {count}
                </div>
              ))}
              {Object.keys(player.tokens).length === 0 && (
                <span className="text-[10px] text-dim italic">No tokens yet</span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2 opacity-60">
              <Shield className="h-3 w-3" />
              <span className="text-[10px] uppercase tracking-tighter">Heroes: {player.heroes.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
