import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Map, Swords, Zap, Shield, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Board: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);

  const currentPlayer = state.players[state.currentTurn];
  const canAssign = !currentPlayer.isAI && state.phase === 'ASSIGNMENT';

  const toggleHero = (heroId: string) => {
    setSelectedHeroes(prev => 
      prev.includes(heroId) ? prev.filter(id => id !== heroId) : [...prev, heroId]
    );
  };

  const handleStartMission = () => {
    if (selectedMission && selectedHeroes.length > 0) {
      dispatch({ 
        type: 'ASSIGN_HERO', 
        playerId: currentPlayer.id, 
        missionId: selectedMission, 
        heroIds: selectedHeroes 
      });
      setSelectedHeroes([]);
      setSelectedMission(null);
    }
  };

  const handleCombatStart = () => {
    dispatch({ type: 'START_MISSION', playerId: currentPlayer.id });
    setTimeout(() => {
      dispatch({ type: 'RESOLVE_COMBAT', playerId: currentPlayer.id, seed: Date.now().toString() });
    }, 1500);
  };

  const handleApplyReward = () => {
    dispatch({ type: 'APPLY_REWARD', playerId: currentPlayer.id });
    setTimeout(() => {
      dispatch({ type: 'END_TURN', playerId: currentPlayer.id });
    }, 500);
  };

  return (
    <div className="glass-panel h-full flex flex-col">
      <div className="panel-header">
        <Map className="h-4 w-4 text-gold" />
        <h3>Kingdom Quest Board</h3>
      </div>

      <div className="panel-content flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {(state.phase === 'TAVERN' || state.phase === 'ASSIGNMENT') ? (
            <motion.div 
              key="assignment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Mission Grid */}
              <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 mb-4" style={{ minHeight: 0 }}>
                {state.missions.map((mission) => (
                  <div 
                    key={mission.id}
                    onClick={() => canAssign && setSelectedMission(mission.id)}
                    className={`mission-card group ${selectedMission === mission.id ? 'selected' : ''}`}
                  >
                    <div className="h-20 relative overflow-hidden bg-black/40">
                      <img src={mission.image} alt={mission.kingdom} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-2 left-3 flex items-center gap-2">
                        <Crown className="h-3 w-3 text-gold" />
                        <span className="text-[10px] uppercase font-bold text-gold tracking-widest">{mission.kingdom}</span>
                      </div>
                    </div>
                    
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight mb-2">
                        {mission.story}
                      </h4>
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex gap-3">
                          <span className="text-gold font-bold">🪙 {mission.goldReward}</span>
                          <span className="text-blue-400 font-bold">✨ {mission.xp} XP</span>
                        </div>
                        <span className="text-dim">LVL {mission.levelRange[0]}-{mission.levelRange[1]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selection Interface Area */}
              {selectedMission && (
                <div className="bg-black/40 border border-gold/30 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-gold uppercase mb-2">Assign Heroes for this Quest</h4>
                      <div className="flex gap-2 flex-wrap">
                        {currentPlayer.heroes.map(hero => (
                          <button
                            key={hero.id}
                            onClick={() => toggleHero(hero.id)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all ${
                              selectedHeroes.includes(hero.id) 
                                ? 'bg-gold text-black border-gold shadow-[0_0_10px_rgba(197,160,89,0.3)]' 
                                : 'bg-white/5 border-white/10 text-dim'
                            }`}
                          >
                            {hero.name} (🎲 {hero.baseDice})
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      className="glow-btn w-full"
                      disabled={selectedHeroes.length === 0}
                      onClick={handleStartMission}
                    >
                      Begin Expedition
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (state.phase === 'MISSION' || state.phase === 'REWARD') ? (
            <motion.div 
              key="combat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col bg-black/40 rounded-lg border border-white/5 overflow-hidden"
            >
              {!state.activeMission?.monster ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mb-6">
                    <Zap className="h-10 w-10 text-gold animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 font-heading tracking-widest">ENCOUNTER</h2>
                  <p className="text-sm text-dim italic mb-8 max-w-md">"The path is fraught with danger. A shadow looms ahead..."</p>
                  <button className="glow-btn px-12" onClick={handleCombatStart}>Reveal Foe</button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col p-6">
                  <div className="flex justify-between items-start flex-1">
                    {/* Enemy Side */}
                    <div className="w-[40%] text-center">
                      <div className="aspect-[3/4] max-w-[150px] mx-auto bg-red-900/10 border-2 border-red-900/40 rounded-lg mb-4 flex flex-col items-center justify-center p-4 relative">
                        <Shield className="h-12 w-12 text-red-500/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        <h4 className="text-red-500 text-xs font-black uppercase mb-1 z-10">{state.activeMission.monster.name}</h4>
                        <div className="text-2xl font-black text-white z-10">⚔️ {state.activeMission.monster.power}</div>
                        <div className="text-[10px] text-dim z-10">DICE: {state.activeMission.monster.diceCount}</div>
                      </div>
                      <div className="flex gap-1.5 justify-center flex-wrap">
                        {state.activeMission.monsterRolls?.map((r, i) => (
                          <div key={i} className="w-8 h-8 bg-red-900/50 border border-red-500 text-white font-bold flex items-center justify-center rounded-md shadow-inner">
                            {r}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 self-center text-center">
                      <div className="text-5xl font-black italic text-gold/30 tracking-tighter selec-none">VS</div>
                    </div>

                    {/* Heroes Side */}
                    <div className="w-[40%] text-center">
                      <div className="aspect-[3/4] max-w-[150px] mx-auto bg-blue-900/10 border-2 border-blue-900/40 rounded-lg mb-4 flex flex-col items-center justify-center p-4 relative">
                        <Swords className="h-12 w-12 text-blue-500/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        <h4 className="text-blue-400 text-xs font-black uppercase mb-1 z-10">The Guild</h4>
                        <div className="text-2xl font-black text-white z-10">🛡️ ROLL</div>
                        <div className="text-[9px] text-dim px-2 z-10 truncate w-full">
                          {state.activeMission.assignedHeroes.map(h => h.name).join(', ')}
                        </div>
                      </div>
                      <div className="flex gap-1.5 justify-center flex-wrap">
                        {state.activeMission.playerRolls?.map((r, i) => (
                          <div key={i} className="w-8 h-8 bg-blue-900/50 border border-blue-400 text-white font-bold flex items-center justify-center rounded-md shadow-inner">
                            {r}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Resolution Final */}
                  <AnimatePresence>
                    {state.activeMission.winner && (
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mt-6 pt-6 border-t border-white/5 text-center"
                      >
                        <h2 className={`text-3xl font-black mb-4 tracking-widest ${state.activeMission.winner === currentPlayer.id ? 'text-gold' : 'text-red-500'}`}>
                          {state.activeMission.winner === currentPlayer.id ? 'VICTORY' : 'DEFEAT'}
                        </h2>
                        <button className="glow-btn px-16" onClick={handleApplyReward}>Claim Results</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center italic text-dim">
               Consulting the chronicles...
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
