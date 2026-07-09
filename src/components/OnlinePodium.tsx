import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, Medal } from 'lucide-react';
import { OnlinePlayer } from '../lib/onlineService';

interface OnlinePodiumProps {
  players: OnlinePlayer[];
  localPlayerId: string;
}

export const OnlinePodium: React.FC<OnlinePodiumProps> = ({ players, localPlayerId }) => {
  // Sort players by:
  // 1. completedAt timestamp (if finished, who completed first or who has totalTime)
  // 2. Or progress index (who completed more missions)
  // 3. Or name
  const sorted = [...players].sort((a, b) => {
    const aFinished = a.completedAt !== null && a.totalTime !== null;
    const bFinished = b.completedAt !== null && b.totalTime !== null;

    if (aFinished && bFinished) {
      return (a.totalTime || 0) - (b.totalTime || 0);
    }
    if (aFinished) return -1;
    if (bFinished) return 1;

    // If neither finished, sort by currentMissionIndex descending
    if (a.currentMissionIndex !== b.currentMissionIndex) {
      return b.currentMissionIndex - a.currentMissionIndex;
    }

    return a.name.localeCompare(b.name);
  });

  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6 select-none">
      
      {/* 3D-like Podium Visuals */}
      <div className="flex items-end justify-center h-48 sm:h-52 gap-2 sm:gap-4 mt-4 border-b border-slate-800 pb-2">
        
        {/* 2nd Place */}
        {second ? (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center w-24 sm:w-28 text-center"
          >
            <span className="text-3xl mb-1 filter drop-shadow">{second.emoji}</span>
            <span className="text-[10px] font-extrabold truncate w-20 text-slate-300">{second.name}</span>
            <span className="text-[9px] font-mono text-slate-400 font-bold">
              {second.totalTime ? `${second.totalTime.toFixed(2)}초` : `${second.currentMissionIndex}/20`}
            </span>
            {/* Podium block */}
            <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-xl mt-2 flex flex-col items-center justify-center border-t border-slate-600/40 shadow-lg relative">
              <span className="text-2xl font-black text-slate-400">2</span>
              <Medal className="w-4 h-4 text-slate-400 absolute bottom-1" />
            </div>
          </motion.div>
        ) : (
          <div className="w-24 sm:w-28" />
        )}

        {/* 1st Place */}
        {first ? (
          <motion.div 
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
            className="flex flex-col items-center w-28 sm:w-32 text-center"
          >
            <div className="relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg animate-bounce">👑</span>
              <span className="text-4xl mb-1 filter drop-shadow">{first.emoji}</span>
            </div>
            <span className="text-xs font-black truncate w-24 text-amber-300">{first.name}</span>
            <span className="text-[10px] font-mono text-amber-400 font-extrabold">
              {first.totalTime ? `${first.totalTime.toFixed(2)}초` : `${first.currentMissionIndex}/20`}
            </span>
            {/* Podium block */}
            <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-amber-950/60 to-amber-500/30 rounded-t-2xl mt-2 flex flex-col items-center justify-center border-t border-amber-400/40 shadow-xl relative">
              <span className="text-3xl font-black text-amber-300">1</span>
              <Trophy className="w-5 h-5 text-amber-400 absolute bottom-2 animate-pulse" />
            </div>
          </motion.div>
        ) : (
          <div className="w-28 sm:w-32" />
        )}

        {/* 3rd Place */}
        {third ? (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center w-24 sm:w-28 text-center"
          >
            <span className="text-3xl mb-1 filter drop-shadow">{third.emoji}</span>
            <span className="text-[10px] font-extrabold truncate w-20 text-slate-300">{third.name}</span>
            <span className="text-[9px] font-mono text-slate-400 font-bold">
              {third.totalTime ? `${third.totalTime.toFixed(2)}초` : `${third.currentMissionIndex}/20`}
            </span>
            {/* Podium block */}
            <div className="w-full h-12 sm:h-14 bg-gradient-to-t from-amber-900/40 to-amber-800/20 rounded-t-xl mt-2 flex flex-col items-center justify-center border-t border-amber-800/30 shadow shadow-amber-950 relative">
              <span className="text-xl font-black text-amber-600">3</span>
              <Medal className="w-4 h-4 text-amber-600 absolute bottom-1" />
            </div>
          </motion.div>
        ) : (
          <div className="w-24 sm:w-28" />
        )}

      </div>

      {/* Full Leaderboard Standings Table */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-inner">
        <h3 className="text-xs font-black text-slate-400 flex items-center gap-1.5 mb-3">
          <Clock className="w-4 h-4 text-cyan-400" />
          레이스 순위 결과표
        </h3>

        <div className="flex flex-col gap-2">
          {sorted.map((p, idx) => {
            const isLocal = p.id === localPlayerId;
            const finished = p.completedAt !== null && p.totalTime !== null;
            
            return (
              <div 
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isLocal 
                    ? 'bg-sky-950/20 border-sky-500/40 shadow-sm shadow-sky-500/5' 
                    : 'bg-slate-900/40 border-slate-850/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-slate-500 w-4">
                    #{idx + 1}
                  </span>
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex flex-col">
                    <span className={`text-xs font-black ${isLocal ? 'text-sky-300' : 'text-slate-200'}`}>
                      {p.name}
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold">
                      {isLocal ? '나 (Local)' : '온라인 상대'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {finished ? (
                    <span className="font-mono text-sm font-black text-emerald-400">
                      ⏱️ {p.totalTime?.toFixed(2)}초
                    </span>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-extrabold text-slate-400">
                        진행 중... ({p.currentMissionIndex}/20)
                      </span>
                      <div className="w-16 bg-slate-800 h-1 rounded overflow-hidden mt-1">
                        <div className="bg-cyan-500 h-full" style={{ width: `${(p.currentMissionIndex / 20) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
