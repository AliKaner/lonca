import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Home } from 'lucide-react';

export const Tavern: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const currentPlayer = state.players[state.currentTurn];

  const handleBuy = (heroId: string) => {
    dispatch({ type: 'BUY_HERO', playerId: currentPlayer.id, heroId });
  };

  const handleSkip = () => {
    dispatch({ type: 'SKIP_TAVERN', playerId: currentPlayer.id });
  };

  return (
    <div className="glass-panel" style={{ flex: '0 0 520px' }}>
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-gold" />
          <h3>Grand Tavern</h3>
        </div>
        <button 
          onClick={handleSkip}
          disabled={state.phase !== 'TAVERN'}
          className="glow-btn px-3 py-1.5"
        >
          Skip Phase
        </button>
      </div>

      <div className="panel-content">
        <div className="flex flex-col gap-4">
          {state.tavern.map((hero) => {
            const canAfford = currentPlayer.gold >= hero.cost;
            const isDisabled = state.phase !== 'TAVERN' || !canAfford;

            return (
              <div key={hero.id} className="hero-card group relative">
                <div className="flex h-32">
                  {/* Hero Portrait Area */}
                  <div className="w-1/3 relative overflow-hidden bg-black/40 border-r border-white/5">
                    <img 
                      src={hero.image} 
                      alt={hero.name}
                      className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] border border-white/10">
                      LVL {hero.level}
                    </div>
                  </div>

                  {/* Hero Info Area */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-white truncate pr-2">{hero.name}</h4>
                        <span className="text-[10px] px-1.5 bg-white/5 rounded border border-white/10 uppercase tracking-widest text-dim">
                          {hero.rank}
                        </span>
                      </div>
                      <p className="text-[10px] text-dim italic leading-tight mb-2 line-clamp-2">
                        {hero.passiveAbility}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gold font-bold">🪙 {hero.cost}</span>
                        <span className="text-[10px] text-dim">| 🎲 {hero.baseDice}</span>
                      </div>
                      <button 
                        onClick={() => handleBuy(hero.id)}
                        disabled={isDisabled}
                        className="glow-btn py-1 px-4 text-[10px]"
                      >
                        Recruit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
