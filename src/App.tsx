import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Tavern } from './ui/Tavern.tsx';
import { SocketClient } from './network/socketClient';
import { Sword, ScrollText, Coins, Trophy, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerPanel } from './ui/PlayerPanel.tsx';
import { Board } from './ui/Board.tsx';
// import { LogPanel } from './ui/LogPanel';

const App: React.FC = () => {
  const { state } = useGameStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_socket, setSocket] = useState<SocketClient | null>(null);

  useEffect(() => {
    // For mock mode, we use Player 1 as the local player
    const client = new SocketClient('player_0');
    client.connect('ws://mock');
    
    client.onMessage((msg) => {
      if (msg.type === 'STATE_UPDATE') {
        useGameStore.setState({ state: msg.state });
      } else if (msg.type === 'ERROR') {
        console.error(msg.message);
      }
    });

    setSocket(client);
    
    // Inject client into store for dispatching through network
    useGameStore.setState({
      dispatch: (action) => client.sendAction(action)
    });

  }, []);

  const currentPlayer = state.players[state.currentTurn];

  return (
    <div id="root">
      <header>
        <div className="logo">Seven Kingdoms Guild</div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Coins className="text-gold h-5 w-5" />
            <span className="font-bold text-gold">{currentPlayer?.gold ?? 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="text-blue-400 h-5 w-5" />
            <span className="font-bold text-blue-400">{currentPlayer?.xp ?? 0} XP</span>
          </div>
          <div className="px-4 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
            Phase: <span className="text-white font-bold">{state.phase}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-dim">Current Turn:</span>
          <span className="font-bold text-white">{currentPlayer?.name}</span>
        </div>
      </header>

      <main className="game-container">
        {/* Left Side: Tavern & Heroes */}
        <aside className="sidebar-column">
          <Tavern />
          
          <div className="glass-panel flex-1">
            <div className="panel-header">
              <Sword className="h-4 w-4 text-gold" />
              <h3>My Guild</h3>
            </div>
            <div className="panel-content">
              <div className="grid grid-cols-1 gap-2">
                {currentPlayer?.heroes.map((hero, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold">{hero.name}</span>
                      <span className="text-[10px] text-dim">Level {hero.level}</span>
                    </div>
                    <span className="text-gold font-bold">🎲 {hero.baseDice}</span>
                  </div>
                ))}
                {currentPlayer?.heroes.length === 0 && (
                  <p className="text-xs text-dim italic text-center mt-4">No heroes recruited yet.</p>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Board */}
        <section className="main-column">
          <Board />
        </section>

        {/* Right Side: Players & Logs */}
        <aside className="sidebar-column">
          <PlayerPanel />
          
          <div className="glass-panel flex-1">
            <div className="panel-header">
              <ScrollText className="h-4 w-4 text-gold" />
              <h3>Chronicles</h3>
            </div>
            <div className="panel-content">
              <div className="flex flex-col gap-3">
                {state.logs.map((log) => (
                  <div key={log.id} className="text-[11px] border-b border-white/5 pb-2 leading-relaxed">
                    <span className="text-dim mr-2 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={
                      log.type === 'COMBAT' ? 'text-red-400 font-bold' : 
                      log.type === 'REWARD' ? 'text-green-400 font-bold' : 
                      'text-primary'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {state.phase === 'GAME_OVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-panel max-w-lg w-full p-12 text-center border-gold border-2 shadow-[0_0_50px_rgba(197,160,89,0.2)]"
            >
              <Crown className="h-20 w-20 text-gold mx-auto mb-6" />
              <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">VICTORY</h1>
              <p className="text-xl text-gold font-bold mb-8 uppercase tracking-widest">
                {state.players.find(p => state.logs.some(l => l.message.includes(p.name) && l.message.includes('CONQUERED')) )?.name}
              </p>
              <p className="text-dim italic mb-12">"The realms have been united under a single banner. A new age of prosperity begins."</p>
              <button 
                onClick={() => window.location.reload()} 
                className="glow-btn px-12 py-4 text-lg"
              >
                Begin New Legend
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
