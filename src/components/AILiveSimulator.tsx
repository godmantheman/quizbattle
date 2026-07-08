import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AILiveSimulatorProps {
  missionName: string;
  progressPercent: number;
  color: string;
  avatar: string;
}

export const AILiveSimulator: React.FC<AILiveSimulatorProps> = ({
  missionName,
  progressPercent,
  color,
  avatar,
}) => {
  // Use a internal tick for animations like flying cursors and rotating objects
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Determine standard theme styling matching Missions.tsx colors
  const borderCol = color === 'blue' ? 'border-sky-500' : 'border-amber-500';
  const textCol = color === 'blue' ? 'text-sky-600' : 'text-amber-600';
  const btnCol = color === 'blue' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-amber-500 hover:bg-amber-600';
  const themeRing = color === 'blue' ? 'border-sky-500' : 'border-amber-500';

  // Return the title and description matching actual Missions.tsx
  const getMissionText = () => {
    switch (missionName) {
      case 'palm_scan':
        return { title: '지문 인식 시스템', desc: '지문 인식기 위에 손가락을 2초간 꾹 누르세요.' };
      case 'gugudan':
        return { title: '구구단 레이스', desc: '초록 칠판에 적힌 구구단 문제의 정답을 빠르게 고르세요!' };
      case 'erase_chalk':
        return { title: '칠판 지우개 소동', desc: '선생님이 오시기 전에 칠판을 구석구석 깨끗이 지우세요!' };
      case 'bell_chime':
        return { title: '방과후 종치기', desc: '수업 끝! 종치기 버튼을 광클하여 종을 울리세요!' };
      case 'trash_sort':
        return { title: '교실 분리수거', desc: '식판 아래의 배식 도우미가 요청하는 반찬을 터치하세요! (설명 오류 매칭)' };
      case 'locker_cipher':
        return { title: '사물함 암호 풀기', desc: '순서대로 사물함 암호를 입력하세요!' };
      case 'pencil_sharpen':
        return { title: '연필 깎기 마스터', desc: '연필이 다 깎일 때까지 회전 핸들을 마구 연타하세요!' };
      case 'catch_flies':
        return { title: '파리 소탕작전', desc: '칠판 주위를 날아다니는 파리들을 빠르게 때려잡으세요!' };
      case 'lunch_tray':
        return { title: '오늘의 급식판', desc: '식판 아래의 배식 도우미가 요청하는 반찬을 터치하세요!' };
      case 'ascending_numbers':
        return { title: '비밀 통로 찾기', desc: '가장 작은 숫자 카드부터 오름차순 순서대로 터치하세요!' };
      case 'card_matching':
        return { title: '학교 용품 짝맞추기', desc: '뒤집힌 카드 중 같은 짝의 카드를 찾아 모두 매칭하세요!' };
      case 'pop_balloons':
        return { title: '축제 풍선 터뜨리기', desc: '하늘로 둥실둥실 떠오르는 축제 풍선들을 바늘로 콕콕 찔러 다 터뜨리세요!' };
      default:
        return { title: 'AI 미션 수행 중', desc: 'AI 분석 연산 수행 중...' };
    }
  };

  const { title, desc } = getMissionText();

  // Render the simulated screen perfectly matching Missions.tsx styling
  const renderInteractiveScreen = () => {
    switch (missionName) {
      case 'palm_scan': {
        const isPressing = progressPercent > 5 && progressPercent < 95;
        // SVG circle dimensions
        const strokeDasharray = 2 * Math.PI * 90;
        const strokeDashoffset = strokeDasharray * (1 - progressPercent / 100);

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2">
            <div className="relative flex items-center justify-center w-52 h-52">
              {/* Concentric rings */}
              <div className={`absolute inset-0 border-2 rounded-full ${themeRing} opacity-20 animate-ping`} />
              
              {/* Progress Circle SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="104" cy="104" r="90" className="stroke-gray-100 fill-none" strokeWidth="8" />
                <circle
                  cx="104"
                  cy="104"
                  r="90"
                  className={`fill-none transition-all duration-100 stroke-amber-500`}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Scan overlay */}
              {isPressing && (
                <div className="absolute inset-8 rounded-full bg-red-500/10 animate-pulse pointer-events-none" />
              )}

              {/* Hand Button */}
              <div
                className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all shadow-xl ${
                  isPressing 
                    ? 'bg-red-500 text-white scale-105 shadow-red-500/30' 
                    : `${btnCol} text-white shadow-amber-500/20`
                }`}
              >
                <motion.span 
                  animate={isPressing ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="text-5xl"
                >
                  ✋
                </motion.span>
                <span className="text-xs font-bold mt-1">
                  {isPressing ? '인식 중...' : '꾹 누르기!'}
                </span>
              </div>

              {/* Virtual Finger Cursor */}
              {progressPercent > 5 && progressPercent < 100 && (
                <motion.div
                  animate={{ scale: [1, 0.9, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="absolute z-20 text-3xl pointer-events-none"
                  style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  👆
                </motion.div>
              )}
            </div>

            {/* Bottom Progress */}
            <div className="w-11/12 max-w-xs text-center mt-3">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-75" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">2초 동안 유지하세요</p>
            </div>
          </div>
        );
      }

      case 'gugudan': {
        // Mock multiplication card matching the user's chalkboard
        const questions = [
          { n1: 6, n2: 7, choices: [36, 42, 48, 54], ans: 42 },
          { n1: 8, n2: 4, choices: [28, 32, 36, 40], ans: 32 },
          { n1: 9, n2: 5, choices: [40, 45, 50, 54], ans: 45 },
        ];
        // Cycle question based on current percentage to look progressive
        const qIdx = Math.floor(progressPercent / 34) % questions.length;
        const q = questions[qIdx];
        const correctIdx = q.choices.indexOf(q.ans);

        // Calculate cursor path based on tick
        const pathStep = tick % 4; // 0: moving, 1: hovering, 2: clicked, 3: rest
        const choicePositions = [
          { x: '25%', y: '68%' },  // Button 1
          { x: '75%', y: '68%' },  // Button 2
          { x: '25%', y: '85%' },  // Button 3
          { x: '75%', y: '85%' },  // Button 4
        ];
        const targetPos = choicePositions[correctIdx];
        const cursorX = pathStep === 0 ? '50%' : targetPos.x;
        const cursorY = pathStep === 0 ? '50%' : targetPos.y;

        const isClicked = pathStep >= 2;

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2 relative">
            {/* Blackboard display */}
            <div className="w-11/12 max-w-xs bg-slate-800 border-4 border-amber-900 rounded-xl py-5 px-3 shadow-inner text-center relative overflow-hidden mb-3">
              <span className="font-mono text-[9px] text-green-400/80 block mb-1">MATH CLASS</span>
              <div className="text-3xl font-extrabold text-white tracking-widest flex items-center justify-center gap-2">
                <span>{q.n1}</span>
                <span className="text-amber-400 text-2xl">×</span>
                <span>{q.n2}</span>
                <span className="text-slate-400">=</span>
                <span className="text-emerald-400">?</span>
              </div>
            </div>

            {/* Choices Grid */}
            <div className="grid grid-cols-2 gap-2.5 w-11/12 max-w-xs relative">
              {q.choices.map((choice, idx) => {
                const isTarget = idx === correctIdx;
                const activeStyle = isTarget && isClicked
                  ? 'bg-emerald-500 border-2 border-emerald-600 text-white scale-95 shadow-lg'
                  : isTarget && pathStep === 1
                  ? 'bg-amber-100 border-2 border-amber-400 text-amber-900'
                  : 'bg-white border-2 border-amber-100 text-amber-800 hover:bg-amber-50';

                return (
                  <div
                    key={idx}
                    className={`py-3.5 px-1 rounded-xl text-xl font-black text-center shadow-md transition-all ${activeStyle}`}
                  >
                    {choice}
                  </div>
                );
              })}
            </div>

            {/* Simulated Cursor */}
            <motion.div
              animate={{ left: cursorX, top: cursorY }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute z-20 text-3xl pointer-events-none"
              style={{ transform: 'translate(-30%, -30%)' }}
            >
              👆
            </motion.div>
          </div>
        );
      }

      case 'erase_chalk': {
        const totalBlocks = 16;
        // Total erased count mirrors progressPercent
        const erasedCount = Math.floor((progressPercent / 100) * totalBlocks);
        
        // Block labels
        const doodles = [
          'x + y = 3', '✏️', '★', '77', 'Math', 'School', 'A+', '❤️',
          '3x = 9', 'Hello', '100', 'OMG', '💤', 'Zzz', 'H2O', '√2'
        ];

        // Sponge movement track
        const spongeX = `${20 + (tick % 4) * 20}%`;
        const spongeY = `${25 + ((tick * 2) % 4) * 15}%`;

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2">
            {/* Chalkboard Stage */}
            <div className="w-11/12 max-w-xs aspect-square bg-emerald-950 border-8 border-amber-900 rounded-2xl shadow-xl p-2 relative overflow-hidden flex flex-col justify-between">
              <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full">
                {Array.from({ length: totalBlocks }).map((_, id) => {
                  const isBlockErased = id < erasedCount;
                  return (
                    <div
                      key={id}
                      className={`relative rounded-md flex items-center justify-center transition-all duration-300 ${
                        isBlockErased 
                          ? 'bg-transparent' 
                          : 'bg-zinc-800/90 border border-zinc-700/50 shadow-inner'
                      }`}
                    >
                      {!isBlockErased && (
                        <span className="font-mono text-[9px] font-bold text-zinc-400 select-none">
                          {doodles[id % doodles.length]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom wood tray */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-800/80" />

              {/* Animated Sponge Cleaner */}
              {progressPercent < 100 && (
                <motion.div
                  animate={{ left: spongeX, top: spongeY }}
                  transition={{ duration: 0.3, ease: 'linear' }}
                  className="absolute z-20 bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded shadow-lg border border-amber-300 font-black flex items-center gap-0.5"
                >
                  🧽 <span className="text-[8px]">AI CHALK</span>
                </motion.div>
              )}
            </div>

            {/* Bottom Percent Track */}
            <div className="w-11/12 max-w-xs text-center mt-3">
              <div className="text-xs font-bold text-slate-600 mb-1">
                지운 면적: {progressPercent.toFixed(0)}%
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-150" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        );
      }

      case 'bell_chime': {
        const requiredTaps = 15;
        const taps = Math.floor((progressPercent / 100) * requiredTaps);
        const isSwinging = tick % 2 === 0 && progressPercent < 100;

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2">
            <div className="relative flex items-center justify-center w-48 h-48">
              {/* Button */}
              <div className="relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center bg-white border-4 border-yellow-400 shadow-xl transition-transform">
                <motion.div
                  animate={isSwinging ? { rotate: [-15, 15, -10, 10, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-6xl select-none"
                >
                  🔔
                </motion.div>
                <span className="text-[10px] font-bold text-yellow-600 mt-1">TAP TAP!</span>
              </div>

              {/* Expanding Shockwaves */}
              <AnimatePresence>
                {isSwinging && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute w-28 h-28 rounded-full border-4 border-yellow-400 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* Tapping virtual cursor */}
              {progressPercent < 100 && (
                <motion.div
                  animate={{ scale: [1, 0.85, 1], y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.3 }}
                  className="absolute z-20 text-3xl pointer-events-none"
                  style={{ right: '15%', bottom: '15%' }}
                >
                  👆
                </motion.div>
              )}
            </div>

            {/* Bottom Tap Progress */}
            <div className="w-11/12 max-w-xs text-center mt-3">
              <div className="text-base font-extrabold text-slate-800 mb-1">
                남은 타수: <span className="text-red-500 text-xl">{Math.max(requiredTaps - taps, 0)}</span>번
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-amber-500 transition-all duration-100" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        );
      }

      case 'trash_sort': {
        const trashList = [
          { name: '공책 📄', type: 'paper' },
          { name: '생수통 🧴', type: 'plastic' },
          { name: '음료수캔 🥫', type: 'metal' }
        ];
        const stepIdx = Math.floor(progressPercent / 34) % 3;
        const activeTrash = trashList[stepIdx];

        // Virtual Cursor drags the item down to bin
        const sortStep = tick % 4; // 0: spawning, 1: grabbing, 2: dragging down, 3: classifying
        
        let trashY = '40%';
        let cursorX = '50%';
        let cursorY = '50%';
        let isTargetBinActive = false;

        // Bins coords: paper = left(20%), plastic = center(50%), metal = right(80%)
        const binX = activeTrash.type === 'paper' ? '20%' : activeTrash.type === 'plastic' ? '50%' : '80%';

        if (sortStep === 0) {
          trashY = '25%';
          cursorX = '50%';
          cursorY = '15%';
        } else if (sortStep === 1) {
          trashY = '40%';
          cursorX = '50%';
          cursorY = '45%';
        } else if (sortStep === 2) {
          trashY = '65%';
          cursorX = binX;
          cursorY = '70%';
        } else {
          trashY = '80%';
          cursorX = binX;
          cursorY = '85%';
          isTargetBinActive = true;
        }

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2 relative">
            {/* Next Garbage Card */}
            <div className="w-10/12 max-w-xs bg-white rounded-2xl border-2 border-dashed border-gray-300 py-4 px-6 shadow-md text-center flex flex-col items-center justify-center mb-3 min-h-[110px]">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">다음 쓰레기</span>
              <div className="text-3xl my-2.5 font-black text-gray-800">
                {activeTrash.name}
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">({stepIdx}/3 완료)</span>
            </div>

            {/* Three Sorting Bins */}
            <div className="grid grid-cols-3 gap-2 w-11/12 max-w-xs relative">
              <div className={`flex flex-col items-center justify-center py-3.5 px-1 bg-blue-50 border-2 rounded-xl shadow-sm text-center transition-all ${isTargetBinActive && activeTrash.type === 'paper' ? 'border-blue-500 scale-95 bg-blue-100' : 'border-blue-200'}`}>
                <span className="text-2xl mb-0.5">📄</span>
                <span className="text-[10px] font-bold text-blue-700">종이류</span>
              </div>

              <div className={`flex flex-col items-center justify-center py-3.5 px-1 bg-emerald-50 border-2 rounded-xl shadow-sm text-center transition-all ${isTargetBinActive && activeTrash.type === 'plastic' ? 'border-emerald-500 scale-95 bg-emerald-100' : 'border-emerald-200'}`}>
                <span className="text-2xl mb-0.5">🧴</span>
                <span className="text-[10px] font-bold text-emerald-700">플라스틱</span>
              </div>

              <div className={`flex flex-col items-center justify-center py-3.5 px-1 bg-amber-50 border-2 rounded-xl shadow-sm text-center transition-all ${isTargetBinActive && activeTrash.type === 'metal' ? 'border-amber-500 scale-95 bg-amber-100' : 'border-amber-200'}`}>
                <span className="text-2xl mb-0.5">🥫</span>
                <span className="text-[10px] font-bold text-amber-700">캔/고철</span>
              </div>
            </div>

            {/* Floating Trash Element for Dragging Visual */}
            {sortStep < 3 && (
              <motion.div
                animate={{ left: cursorX, top: trashY }}
                transition={{ duration: 0.3 }}
                className="absolute z-10 bg-white/95 px-2.5 py-1.5 border border-slate-300 rounded-lg shadow-lg text-xs font-bold -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                {activeTrash.name}
              </motion.div>
            )}

            {/* Virtual hand pointer */}
            <motion.div
              animate={{ left: cursorX, top: cursorY }}
              transition={{ duration: 0.3 }}
              className="absolute z-20 text-3xl pointer-events-none"
              style={{ transform: 'translate(-10%, -10%)' }}
            >
              👆
            </motion.div>
          </div>
        );
      }

      case 'locker_cipher': {
        const pattern = [1, 3, 2]; // pattern indexes
        const userInputCount = Math.floor((progressPercent / 100) * pattern.length);
        const isPlayingPattern = progressPercent < 25;

        // Button statuses
        const activeBtn = !isPlayingPattern && (tick % 3 === 0) ? pattern[userInputCount % pattern.length] : null;

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2">
            {/* Locker Safe Body */}
            <div className="w-10/12 max-w-xs bg-stone-700 border-4 border-stone-800 rounded-3xl p-4 shadow-xl flex flex-col items-center gap-3.5 relative">
              <div className="absolute top-1 right-3 text-[8px] font-mono text-stone-400">POCKET LOCKER v2.0</div>
              
              {/* LED dots */}
              <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 py-1.5 px-6 rounded-lg w-full justify-center mt-1">
                {pattern.map((_, i) => (
                  <div 
                    key={i}
                    className={`w-3 h-3 rounded-full border border-stone-800 transition-all ${
                      userInputCount > i 
                        ? 'bg-emerald-400 shadow-emerald-400/50 animate-pulse' 
                        : 'bg-stone-800'
                    }`}
                  />
                ))}
              </div>

              {/* 4 buttons panel */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                {['빨강 🔴', '파랑 🔵', '초록 🟢', '노랑 🟡'].map((name, idx) => {
                  const isLit = activeBtn === idx || (isPlayingPattern && (tick % pattern.length) === idx);
                  const colorStyle = 
                    idx === 0 ? (isLit ? 'bg-red-500 border-red-400 text-white scale-95 shadow-md' : 'bg-red-100 text-red-800 border-red-200') :
                    idx === 1 ? (isLit ? 'bg-blue-500 border-blue-400 text-white scale-95 shadow-md' : 'bg-blue-100 text-blue-800 border-blue-200') :
                    idx === 2 ? (isLit ? 'bg-emerald-500 border-emerald-400 text-white scale-95 shadow-md' : 'bg-emerald-100 text-emerald-800 border-emerald-200') :
                                (isLit ? 'bg-yellow-500 border-yellow-400 text-white scale-95 shadow-md' : 'bg-yellow-100 text-yellow-800 border-yellow-200');

                  return (
                    <div
                      key={idx}
                      className={`py-5 px-1 rounded-2xl font-black text-center text-xs border-2 shadow-sm transition-all ${colorStyle}`}
                    >
                      {name}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pointer finger clicking */}
            {!isPlayingPattern && activeBtn !== null && (
              <motion.div
                animate={{
                  left: activeBtn === 0 ? '30%' : activeBtn === 1 ? '70%' : activeBtn === 2 ? '30%' : '70%',
                  top: activeBtn < 2 ? '62%' : '80%'
                }}
                transition={{ duration: 0.25 }}
                className="absolute z-20 text-3xl pointer-events-none"
              >
                👆
              </motion.div>
            )}

            <div className="text-xs text-slate-500 font-bold mt-3">
              {isPlayingPattern ? '🔐 암호 재생 중... 집중하세요!' : `입력 현황: ${userInputCount}/${pattern.length}`}
            </div>
          </div>
        );
      }

      case 'pencil_sharpen': {
        const requiredSpins = 12;
        const spins = Math.floor((progressPercent / 100) * requiredSpins);
        const isSpinning = progressPercent > 0 && progressPercent < 100 && (tick % 2 === 0);
        const pencilLengthPercent = Math.max(100 - (spins / requiredSpins) * 50, 50);

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2">
            {/* Sharpener Area */}
            <div className="w-11/12 max-w-xs flex flex-col items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl py-5 relative overflow-hidden mb-3">
              
              {/* Pencil */}
              <div className="flex items-center gap-1 mb-6">
                <div 
                  className="h-5 bg-amber-400 border border-amber-500 rounded-l-md transition-all duration-150 relative"
                  style={{ width: `${pencilLengthPercent * 1.3}px` }}
                >
                  <div className="absolute inset-x-0 top-0.5 h-0.5 bg-amber-500/20" />
                  <div className="absolute inset-x-0 bottom-0.5 h-0.5 bg-amber-500/20" />
                </div>
                <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[20px] border-l-orange-200" />
                <div 
                  className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[14px] transition-all duration-150"
                  style={{ borderLeftColor: progressPercent >= 100 ? '#1e293b' : '#94a3b8' }}
                />
              </div>

              {/* Rotary body */}
              <div className="relative flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: spins * 30 }}
                  className="w-20 h-20 bg-sky-600 border-4 border-sky-700 rounded-full flex items-center justify-center shadow-md relative"
                >
                  <div className="w-6 h-6 bg-zinc-800 rounded-full border-2 border-zinc-950" />
                  <div className="absolute top-0.5 w-1.5 h-3.5 bg-sky-800 rounded-sm" />
                  <div className="absolute bottom-0.5 w-1.5 h-3.5 bg-sky-800 rounded-sm" />
                </motion.div>
              </div>
            </div>

            {/* Sharpener Mash Button */}
            <div className="w-11/12 max-w-xs text-center flex flex-col gap-2 relative">
              <div className={`w-full py-3.5 rounded-2xl text-lg font-bold text-white shadow-md transition-all ${btnCol} active:scale-95`}>
                ✏️ 깎기 연타! ({spins}/{requiredSpins})
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-150" style={{ width: `${progressPercent}%` }} />
              </div>

              {/* Speedy clicker finger overlay */}
              {progressPercent < 100 && (
                <motion.div
                  animate={{ scale: [1, 0.85, 1], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  className="absolute z-20 text-3xl pointer-events-none"
                  style={{ right: '10%', bottom: '20%' }}
                >
                  👆
                </motion.div>
              )}
            </div>
          </div>
        );
      }

      case 'catch_flies': {
        const totalFlies = 4;
        const caughtCount = Math.min(Math.floor((progressPercent / 100) * totalFlies), totalFlies);

        // Flies positions that correspond to the fly count
        const flyX = ['25%', '70%', '45%', '80%'];
        const flyY = ['30%', '55%', '25%', '75%'];

        const targetFlyIdx = Math.min(caughtCount, totalFlies - 1);
        const cursorX = flyX[targetFlyIdx];
        const cursorY = flyY[targetFlyIdx];

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2">
            <div className="w-11/12 max-w-xs aspect-square bg-sky-50/50 border-2 border-dashed border-sky-200 rounded-2xl relative overflow-hidden shadow-inner mb-3">
              {Array.from({ length: totalFlies }).map((_, idx) => {
                const isCaught = idx < caughtCount;
                if (isCaught) return null;
                return (
                  <motion.span
                    key={idx}
                    animate={{
                      x: [0, Math.sin(idx) * 10, -Math.cos(idx) * 10, 0],
                      y: [0, Math.cos(idx) * 10, -Math.sin(idx) * 10, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute text-2xl"
                    style={{ left: flyX[idx], top: flyY[idx], transform: 'translate(-50%, -50%)' }}
                  >
                    🪰
                  </motion.span>
                );
              })}

              {caughtCount === totalFlies && (
                <div className="absolute inset-0 flex items-center justify-center font-bold text-green-500">
                  모든 파리 소탕 완료! 🧹
                </div>
              )}

              {/* Swatting fly swatter virtual pointer */}
              {caughtCount < totalFlies && (
                <motion.div
                  animate={{ left: cursorX, top: cursorY, scale: [1.1, 0.8, 1.1] }}
                  transition={{ repeat: Infinity, duration: 1.1 }}
                  className="absolute z-20 text-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
                >
                  🏸
                </motion.div>
              )}
            </div>

            <div className="text-sm font-bold text-slate-600">
              퇴치한 파리: <span className="text-red-500 text-lg">{caughtCount}</span> / {totalFlies}마리
            </div>
          </div>
        );
      }

      case 'lunch_tray': {
        const targetMenu = [
          { name: '🍚 흰 밥', type: 'rice' },
          { name: '🥣 미역국', type: 'soup' },
          { name: '🍗 닭강정', type: 'chicken' }
        ];
        const servedCount = Math.floor((progressPercent / 100) * targetMenu.length);

        // Simulated choice buttons
        const choices = [
          { name: '🍚 흰 밥', type: 'rice' },
          { name: '🥣 미역국', type: 'soup' },
          { name: '🍗 닭강정', type: 'chicken' }
        ];

        const targetFood = targetMenu[Math.min(servedCount, targetMenu.length - 1)];
        const targetBtnIdx = choices.findIndex(c => c.type === targetFood.type);

        // Click pointer position
        const btnX = targetBtnIdx === 0 ? '16%' : targetBtnIdx === 1 ? '50%' : '83%';

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2 relative">
            {/* Cafeteria Tray */}
            <div className={`w-11/12 max-w-xs bg-slate-100 border-4 ${borderCol} rounded-3xl p-4 shadow-lg flex flex-col gap-3 relative mb-3`}>
              <div className="text-center text-[10px] font-bold text-slate-400">TODAY LUNCH MEAL TRAY</div>

              {/* Grid 3 cells */}
              <div className="grid grid-cols-3 gap-2">
                {targetMenu.map((item, i) => {
                  const isServed = servedCount > i;
                  return (
                    <div 
                      key={i}
                      className={`aspect-square bg-slate-200 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 relative transition-all ${
                        isServed ? 'bg-white border-solid border-slate-300 scale-100' : 'opacity-80'
                      }`}
                    >
                      {isServed ? (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl">{item.name.split(' ')[0]}</span>
                          <span className="text-[9px] font-bold text-slate-500 mt-1">{item.name.split(' ')[1]}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center p-1">
                          <span className="text-[9px] text-gray-400 font-bold">대기 중</span>
                          <span className="text-[8px] text-gray-400 mt-0.5 font-mono">{item.name.split(' ')[1]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Request Signboard */}
              {servedCount < targetMenu.length && (
                <div className="bg-amber-100 border border-amber-200 p-1.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-amber-800">
                    👉 <span className="text-red-500 font-extrabold">{targetFood.name.split(' ')[1]}</span> 담아주세요!
                  </span>
                </div>
              )}
            </div>

            {/* Food selections */}
            <div className="grid grid-cols-3 gap-2 w-11/12 max-w-xs relative">
              {choices.map((food, idx) => {
                const alreadyPlaced = servedCount > idx;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center p-2 bg-white border-2 border-slate-200 rounded-xl shadow-sm text-center transition-all ${
                      alreadyPlaced ? 'opacity-30 scale-95' : ''
                    }`}
                  >
                    <span className="text-2xl">{food.name.split(' ')[0]}</span>
                    <span className="text-[9px] font-bold text-gray-600 mt-1">{food.name.split(' ')[1]}</span>
                  </div>
                );
              })}
            </div>

            {/* Virtual mouse clicking target foods */}
            {servedCount < targetMenu.length && (
              <motion.div
                animate={{ left: btnX, top: '85%' }}
                transition={{ duration: 0.35 }}
                className="absolute z-20 text-3xl pointer-events-none"
                style={{ transform: 'translate(-20%, -20%)' }}
              >
                👆
              </motion.div>
            )}
          </div>
        );
      }

      case 'ascending_numbers': {
        const sorted = [12, 34, 56, 78, 90];
        const clearedCount = Math.floor((progressPercent / 100) * sorted.length);

        const gridX = ['18%', '40%', '62%', '84%', '50%'];
        const gridY = ['45%', '45%', '45%', '45%', '60%'];

        const targetBtnIdx = Math.min(clearedCount, sorted.length - 1);
        const cursorX = gridX[targetBtnIdx];
        const cursorY = gridY[targetBtnIdx];

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2 relative">
            {/* Number grid layout */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-11/12 max-w-xs py-4 px-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner mb-3 relative min-h-[120px]">
              {sorted.map((num, idx) => {
                const isCleared = idx < clearedCount;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-16 rounded-xl font-mono text-lg font-black border-2 flex items-center justify-center shadow-sm transition-all ${
                      isCleared 
                        ? 'bg-stone-300 border-stone-400 text-stone-500 scale-95 opacity-50' 
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>

            {/* Hints status bar */}
            <div className="w-11/12 max-w-xs flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-wider">
                현재 타겟: 
                <span className="text-red-500 font-extrabold text-xs ml-1">
                  {clearedCount < sorted.length ? sorted[clearedCount] : '완료!'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-stone-100 py-1.5 px-3 rounded-xl w-full justify-center">
                {sorted.map((num, i) => (
                  <React.Fragment key={i}>
                    <span className={`font-mono text-[10px] font-extrabold ${i < clearedCount ? 'text-green-500 line-through' : 'text-slate-400'}`}>
                      {num}
                    </span>
                    {i < sorted.length - 1 && <span className="text-slate-300 text-[8px]">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* AI mouse moving sequentially */}
            {clearedCount < sorted.length && (
              <motion.div
                animate={{ left: cursorX, top: '25%' }}
                transition={{ duration: 0.3 }}
                className="absolute z-20 text-3xl pointer-events-none"
              >
                👆
              </motion.div>
            )}
          </div>
        );
      }

      case 'card_matching': {
        const totalCards = 4;
        const step = tick % 4; // 0: unopened, 1: card 1 flip, 2: card 2 flip & matches, 3: completed
        const isFlipped1 = step >= 1 || progressPercent >= 100;
        const isFlipped2 = step >= 2 || progressPercent >= 100;

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2 relative">
            <div className={`grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner max-w-xs w-11/12 justify-center mb-3 min-h-[140px]`}>
              {/* Card 1 */}
              <div className={`w-full aspect-square rounded-xl text-2xl font-bold flex items-center justify-center transition-all duration-300 shadow-md ${isFlipped1 ? 'bg-white border border-slate-300 scale-95' : 'bg-amber-500 text-white'}`}>
                {isFlipped1 ? '🎒' : '❓'}
              </div>

              {/* Card 2 */}
              <div className={`w-full aspect-square rounded-xl text-2xl font-bold flex items-center justify-center transition-all duration-300 shadow-md ${isFlipped2 ? 'bg-white border border-slate-300 scale-95' : 'bg-amber-500 text-white'}`}>
                {isFlipped2 ? '🎒' : '❓'}
              </div>
            </div>

            {/* Virtual mouse clicks cards */}
            <motion.div
              animate={{
                left: step === 0 ? '25%' : step === 1 ? '25%' : step === 2 ? '75%' : '25%',
                top: '30%'
              }}
              transition={{ duration: 0.35 }}
              className="absolute z-20 text-3xl pointer-events-none"
            >
              👆
            </motion.div>

            <div className="text-xs text-slate-400 font-bold">
              {progressPercent >= 100 || step === 3 ? (
                <span className="text-emerald-500">✨ MATCH PAIR FOUND!</span>
              ) : (
                <span>FLIPPING MATCHING CARDS...</span>
              )}
            </div>
          </div>
        );
      }

      case 'pop_balloons': {
        const balloons = [
          { id: 1, x: 25, y: 55, color: 'bg-red-500' },
          { id: 2, x: 50, y: 35, color: 'bg-sky-500' },
          { id: 3, x: 75, y: 60, color: 'bg-emerald-500' },
        ];
        
        // Match balloon pops with progressPercent
        const popsCount = Math.min(Math.floor((progressPercent / 100) * 4), 3);
        const activeBalloons = balloons.slice(popsCount);

        const targetBalloon = activeBalloons[0] || { x: 50, y: 50 };

        return (
          <div className="flex flex-col items-center justify-center w-full h-full py-2 relative">
            <div className="relative w-11/12 max-w-xs h-48 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner overflow-hidden mb-3">
              {activeBalloons.map(b => (
                <div
                  key={b.id}
                  style={{
                    position: 'absolute',
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: '32px',
                    height: '38px',
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`${b.color} rounded-t-full rounded-b-[40%] flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  <span className="text-xs">🎈</span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-stone-400" />
                </div>
              ))}

              {activeBalloons.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-green-500 font-extrabold text-sm">
                  🎉 대성공!
                </div>
              )}
            </div>

            {/* Pointer Pin chasing floating balloons */}
            {activeBalloons.length > 0 && (
              <motion.div
                animate={{ left: `${targetBalloon.x}%`, top: `${targetBalloon.y}%` }}
                transition={{ duration: 0.3 }}
                className="absolute z-20 text-3xl pointer-events-none"
                style={{ transform: 'translate(-10px, -10px)' }}
              >
                📍
              </motion.div>
            )}

            <div className="text-xs text-slate-400 font-bold">남은 풍선: <span className="text-sky-500 font-extrabold">{activeBalloons.length}</span>개</div>
          </div>
        );
      }

      default:
        return (
          <div className="relative w-full h-48 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center">
            <span className="text-xs text-slate-500">AI 미션 분석 가동 중...</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col justify-between h-full bg-white rounded-2xl border-2 border-dashed border-gray-200 p-4">
      
      {/* Title & Description Header matches MissionRenderer */}
      <div className="text-center border-b border-gray-100 pb-3 mb-1">
        <h4 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          AI {avatar} • {title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>

      {/* Main Interactive Interactive Sandbox Screen */}
      <div className="flex-grow w-full flex items-center justify-center relative">
        {renderInteractiveScreen()}
      </div>

      {/* Progress slider bar matching general visual patterns */}
      <div className="w-11/12 max-w-xs mx-auto flex flex-col gap-1 items-center mt-3 pt-3 border-t border-gray-100">
        <div className="w-full bg-slate-100 border border-slate-200 h-2.5 rounded-full overflow-hidden p-[1px] shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full"
            style={{ width: `${progressPercent}%` }}
            transition={{ ease: "easeOut", duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between w-full text-[9px] font-extrabold text-slate-400 px-1 font-mono uppercase tracking-wider">
          <span>COMPUTING SOLVE</span>
          <span>{progressPercent.toFixed(0)}%</span>
        </div>
      </div>

    </div>
  );
};
