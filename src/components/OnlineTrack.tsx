import React from 'react';
import { motion } from 'motion/react';
import { OnlinePlayer } from '../lib/onlineService';

interface OnlineTrackProps {
  players: OnlinePlayer[];
  localPlayerId: string;
  totalMissions: number;
}

export const OnlineTrack: React.FC<OnlineTrackProps> = ({
  players,
  localPlayerId,
  totalMissions,
}) => {
  // Sort players by mission index to see ranking order, but keep lanes fixed or ordered
  // Let's sort them so that the local player is highlighted, or keep a stable lane layout.
  // Stable lanes make it easy to follow. We can sort them by join order (implied by ID or name) or simply list them.
  const sortedPlayers = [...players].sort((a, b) => {
    // Put local player at the top lane for visibility, then sort others
    if (a.id === localPlayerId) return -1;
    if (b.id === localPlayerId) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-3 shadow-inner relative overflow-hidden select-none mb-3">
      {/* Athletics Stadium Banner */}
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-800 pb-1">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          실시간 온라인 육상 트랙 (Speed Race Track)
        </span>
        <span className="text-amber-500 font-mono">총 20개 미션</span>
      </div>

      {/* Lanes container */}
      <div className="flex flex-col gap-1.5 relative">
        {sortedPlayers.map((player, idx) => {
          const isLocal = player.id === localPlayerId;
          const progress = player.currentMissionIndex;
          const percent = Math.min((progress / totalMissions) * 100, 100);
          
          return (
            <div 
              key={player.id} 
              className={`flex items-center h-8 rounded-lg relative overflow-hidden border transition-all ${
                isLocal 
                  ? 'bg-sky-950/20 border-sky-500/40 shadow-sm shadow-sky-500/5' 
                  : 'bg-slate-900/40 border-slate-800/80'
              }`}
            >
              {/* Lane Number and Nickname */}
              <div className="w-24 sm:w-28 flex items-center gap-1 px-2 border-r border-slate-800/80 z-10 bg-slate-950/90 h-full">
                <span className="font-mono text-[9px] font-black text-slate-500">{idx + 1}레인</span>
                <span className={`text-[10px] font-extrabold truncate max-w-[65px] sm:max-w-[80px] ${isLocal ? 'text-sky-300' : 'text-slate-300'}`}>
                  {player.name}
                </span>
                {isLocal && <span className="text-[8px] bg-sky-500/20 text-sky-400 px-1 rounded border border-sky-500/30 font-bold shrink-0">나</span>}
              </div>

              {/* Running Lane Track */}
              <div className="flex-grow h-full relative bg-[linear-gradient(90deg,transparent_98%,rgba(255,255,255,0.03)_98%)] bg-[size:5%_100%]">
                {/* Lane line indicator */}
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-dashed bg-slate-800/30" />

                {/* Sliding Runner Avatar */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center"
                  style={{ left: `calc(${percent}% - 14px)` }}
                  animate={{ left: `calc(${percent}% - 14px)` }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                >
                  <div className="relative">
                    {/* Ring glow for local player */}
                    {isLocal && (
                      <div className="absolute -inset-1 border border-sky-400 rounded-full animate-ping opacity-40" />
                    )}
                    <span className="text-xl inline-block drop-shadow-md transform hover:scale-125 transition-transform duration-100">
                      {player.emoji}
                    </span>
                  </div>
                </motion.div>

                {/* Progress number on the lane */}
                {percent > 5 && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 text-[8px] font-mono font-bold text-slate-500 pr-1 select-none pointer-events-none"
                    style={{ left: `calc(${percent}% - 34px)` }}
                  >
                    {progress}/20
                  </div>
                )}

                {/* Finished flag */}
                {player.completedAt && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-1 rounded">
                    <span className="text-[8px] font-black text-emerald-400">FINISH 🏁</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
