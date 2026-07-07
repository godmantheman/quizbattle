import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smile, HelpCircle, RefreshCw, Volume2, 
  Trash2, Play, Lock, Sparkles, Shield,
  Award, Trophy, RotateCcw, Flame, Check, X, CheckCircle2,
  AlertTriangle, Hourglass, Zap, Sparkle, Target, Pointer
} from 'lucide-react';
import { MissionState } from '../types';
import { playSound } from '../utils/sound';

interface MissionProps {
  mission: MissionState;
  onComplete: (dataUpdates?: any) => void;
  onFail: () => void;
  color: string; // 'blue' | 'orange'
  isStunned: boolean;
}

export const MissionRenderer: React.FC<MissionProps> = ({
  mission,
  onComplete,
  onFail,
  color,
  isStunned
}) => {
  const borderCol = color === 'blue' ? 'border-sky-500' : 'border-amber-500';
  const bgCol = color === 'blue' ? 'bg-sky-50' : 'bg-amber-50';
  const textCol = color === 'blue' ? 'text-sky-600' : 'text-amber-600';
  const btnCol = color === 'blue' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-amber-500 hover:bg-amber-600';

  if (isStunned) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-6xl mb-4"
        >
          😵
        </motion.div>
        <h3 className="text-xl font-bold text-red-500 mb-2">정신이 혼미합니다! (오답 페널티)</h3>
        <p className="text-gray-500 text-sm">잠시 후 다시 미션을 시도할 수 있습니다...</p>
        <div className="w-48 bg-gray-200 h-2 rounded-full mt-4 overflow-hidden">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 1 }}
            className="bg-red-500 h-full"
          />
        </div>
      </div>
    );
  }

  switch (mission.name) {
    case 'palm_scan':
      return <PalmScanMission mission={mission} onComplete={onComplete} color={color} btnCol={btnCol} />;
    case 'gugudan':
      return <GugudanMission mission={mission} onComplete={onComplete} onFail={onFail} color={color} />;
    case 'erase_chalk':
      return <EraseChalkMission mission={mission} onComplete={onComplete} color={color} />;
    case 'bell_chime':
      return <BellChimeMission mission={mission} onComplete={onComplete} color={color} />;
    case 'trash_sort':
      return <TrashSortMission mission={mission} onComplete={onComplete} onFail={onFail} color={color} />;
    case 'locker_cipher':
      return <LockerCipherMission mission={mission} onComplete={onComplete} onFail={onFail} color={color} />;
    case 'pencil_sharpen':
      return <PencilSharpenMission mission={mission} onComplete={onComplete} color={color} btnCol={btnCol} />;
    case 'catch_flies':
      return <CatchFliesMission mission={mission} onComplete={onComplete} color={color} />;
    case 'lunch_tray':
      return <LunchTrayMission mission={mission} onComplete={onComplete} onFail={onFail} color={color} />;
    case 'ascending_numbers':
      return <AscendingNumbersMission mission={mission} onComplete={onComplete} onFail={onFail} color={color} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <HelpCircle className="w-12 h-12 text-gray-400 mb-2" />
          <p>알 수 없는 미션입니다.</p>
        </div>
      );
  }
};

/* ==========================================================================
   1. Palm Scan Mission (손바닥 꾹 누르기)
   ========================================================================== */
const PalmScanMission: React.FC<{
  mission: MissionState;
  onComplete: () => void;
  color: string;
  btnCol: string;
}> = ({ mission, onComplete, color, btnCol }) => {
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startEpoch = useRef<number>(0);
  const requiredTime = mission.data.requiredTime || 2000;
  const completedRef = useRef(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [mission.id]);

  useEffect(() => {
    if (isPressing) {
      playSound('hold');
      const interval = setInterval(() => {
        playSound('hold');
      }, 300);

      const animationFrame = requestAnimationFrame(function update() {
        const elapsed = Date.now() - startEpoch.current;
        const currentProgress = Math.min((elapsed / requiredTime) * 100, 100);
        setProgress(currentProgress);

        if (elapsed >= requiredTime) {
          clearInterval(interval);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
        } else {
          timerRef.current = requestAnimationFrame(update);
        }
      });

      return () => {
        clearInterval(interval);
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
      };
    } else {
      setProgress(0);
    }
  }, [isPressing]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (Date.now() - mountTime.current < 400) return;
    e.preventDefault();
    setIsPressing(true);
    startEpoch.current = Date.now();
  };

  const handleEnd = () => {
    setIsPressing(false);
  };

  const themeRing = color === 'blue' ? 'border-sky-500' : 'border-amber-500';
  const themeFill = color === 'blue' ? 'bg-sky-500/20' : 'bg-amber-500/20';

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none">
      <div className="text-center">
        <h4 className="text-lg font-bold text-gray-800">{mission.koreanName}</h4>
        <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
      </div>

      <div className="relative flex items-center justify-center w-56 h-56">
        {/* Animated concentric rings */}
        <div className={`absolute inset-0 border-2 rounded-full ${themeRing} opacity-20 animate-ping`} />
        
        {/* Svg Circle Progress */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="112"
            cy="112"
            r="90"
            className="stroke-gray-100 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="112"
            cy="112"
            r="90"
            className={`fill-none transition-all duration-75 ${
              color === 'blue' ? 'stroke-sky-500' : 'stroke-amber-500'
            }`}
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
            strokeLinecap="round"
          />
        </svg>

        {/* Active scan overlay */}
        {isPressing && (
          <div className="absolute inset-8 rounded-full bg-red-500/10 animate-pulse pointer-events-none" />
        )}

        {/* Press Button Container */}
        <button
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onTouchCancel={handleEnd}
          className={`relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 ${
            isPressing 
              ? 'bg-red-500 text-white scale-105 shadow-red-500/30' 
              : `${btnCol} text-white shadow-current/20`
          }`}
          style={{ touchAction: 'none' }}
        >
          <motion.span 
            animate={isPressing ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-6xl"
          >
            ✋
          </motion.span>
          <span className="text-sm font-bold mt-2">
            {isPressing ? '인식 중...' : '꾹 누르기!'}
          </span>
        </button>
      </div>

      <div className="w-11/12 max-w-xs text-center">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-75 ${
              color === 'blue' ? 'bg-sky-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">2초 동안 유지하세요</p>
      </div>
    </div>
  );
};

/* ==========================================================================
   2. Multiplication Table Mission (구구단 레이스)
   ========================================================================== */
const GugudanMission: React.FC<{
  mission: MissionState;
  onComplete: () => void;
  onFail: () => void;
  color: string;
}> = ({ mission, onComplete, onFail, color }) => {
  const { num1, num2, choices, correctAnswer } = mission.data;
  const lastActionTime = useRef(0);
  const completedRef = useRef(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [mission.id]);

  const handleChoice = (val: number) => {
    if (completedRef.current) return;
    if (Date.now() - mountTime.current < 400) return;
    const now = Date.now();
    if (now - lastActionTime.current < 250) return;
    lastActionTime.current = now;

    if (val === correctAnswer) {
      playSound('correct');
      completedRef.current = true;
      onComplete();
    } else {
      playSound('wrong');
      completedRef.current = true;
      onFail();
    }
  };

  const choiceColor = color === 'blue' 
    ? 'bg-white border-2 border-sky-100 text-sky-800 hover:bg-sky-50 hover:border-sky-300 active:bg-sky-100'
    : 'bg-white border-2 border-amber-100 text-amber-800 hover:bg-amber-50 hover:border-amber-300 active:bg-amber-100';

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none">
      <div className="text-center">
        <h4 className="text-lg font-bold text-gray-800">{mission.koreanName}</h4>
        <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
      </div>

      {/* Math Chalkboard display */}
      <div className="w-11/12 max-w-xs bg-slate-800 border-4 border-amber-900 rounded-xl py-6 px-4 shadow-inner text-center relative overflow-hidden">
        <div className="absolute top-1 left-2 w-2 h-2 bg-slate-400 rounded-full opacity-50" />
        <div className="absolute top-1 right-2 w-2 h-2 bg-slate-400 rounded-full opacity-50" />
        <span className="font-mono text-xs text-green-400/80 block mb-1">MATH CLASS</span>
        <div className="text-4xl font-extrabold text-white tracking-widest flex items-center justify-center gap-2">
          <span>{num1}</span>
          <span className="text-amber-400 text-3xl">×</span>
          <span>{num2}</span>
          <span className="text-slate-400">=</span>
          <span className="text-emerald-400">?</span>
        </div>
      </div>

      {/* Choices Grid */}
      <div className="grid grid-cols-2 gap-3 w-11/12 max-w-xs">
        {choices.map((choice: number, idx: number) => (
          <button
            key={idx}
            onTouchStart={(e) => {
              e.preventDefault();
              handleChoice(choice);
            }}
            onClick={() => handleChoice(choice)}
            className={`py-4 px-2 rounded-xl text-2xl font-black text-center shadow-md active:scale-95 transition-all ${choiceColor}`}
          >
            {choice}
          </button>
        ))}
      </div>

      <div className="text-xs text-red-400/90 font-medium">⚠️ 틀리면 1초 동안 기절합니다!</div>
    </div>
  );
};

/* ==========================================================================
   3. Chalkboard Cleaner (칠판 지우기)
   ========================================================================== */
const EraseChalkMission: React.FC<{
  mission: MissionState;
  onComplete: () => void;
  color: string;
}> = ({ mission, onComplete, color }) => {
  const [erased, setErased] = useState<Record<number, boolean>>({});
  const totalBlocks = mission.data.totalBlocks || 16;
  const blocksArray = Array.from({ length: totalBlocks }, (_, i) => i);
  const completedRef = useRef(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [mission.id]);

  // Mark block as erased when mouse/finger enters
  const handleErase = (id: number) => {
    if (completedRef.current) return;
    if (Date.now() - mountTime.current < 400) return;
    if (!erased[id]) {
      setErased(prev => {
        if (completedRef.current) return prev;
        const next = { ...prev, [id]: true };
        playSound('erase');

        // Check if 100% erased
        if (Object.keys(next).length === totalBlocks) {
          completedRef.current = true;
          setTimeout(() => {
            playSound('correct');
            onComplete();
          }, 100);
        }
        return next;
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // Prevent scrolling/zooming while drawing
    e.preventDefault();
    for (let i = 0; i < e.targetTouches.length; i++) {
      const touch = e.targetTouches[i];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element) {
        const blockIdAttr = element.getAttribute('data-block-id');
        // Ensure the element belongs to this player's blackboard to avoid cross-board triggers
        if (blockIdAttr && e.currentTarget.contains(element)) {
          const blockId = parseInt(blockIdAttr, 10);
          handleErase(blockId);
        }
      }
    }
  };

  // Chalk doodles list for rendering inside blocks
  const doodles = [
    'x + y = 3', '✏️', '★', '77', 'Math', 'School', 'A+', '❤️',
    '3x = 9', 'Hello', '100', 'OMG', '💤', 'Zzz', 'H2O', '√2'
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none">
      <div className="text-center">
        <h4 className="text-lg font-bold text-gray-800">{mission.koreanName}</h4>
        <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
      </div>

      {/* Blackboard Stage */}
      <div 
        className="w-11/12 max-w-xs aspect-square bg-emerald-950 border-8 border-amber-900 rounded-2xl shadow-xl p-2 relative overflow-hidden flex flex-col justify-between"
        onTouchMove={handleTouchMove}
        style={{ touchAction: 'none' }}
      >
        <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full">
          {blocksArray.map((id) => {
            const isBlockErased = erased[id];
            return (
              <div
                key={id}
                data-block-id={id}
                onMouseEnter={() => handleErase(id)}
                onTouchStart={() => handleErase(id)}
                className={`relative rounded-md flex items-center justify-center transition-all duration-300 ${
                  isBlockErased 
                    ? 'bg-transparent' 
                    : 'bg-zinc-800/90 border border-zinc-700/50 shadow-inner'
                }`}
              >
                {!isBlockErased && (
                  <span 
                    data-block-id={id}
                    className="font-mono text-xs font-bold text-zinc-400 select-none pointer-events-none"
                  >
                    {doodles[id % doodles.length]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Chalk dust tray at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-800/80" />
      </div>

      {/* Percent Tracker */}
      <div className="w-11/12 max-w-xs text-center">
        <div className="text-sm font-bold text-slate-600 mb-1">
          지운 면적: {Math.round((Object.keys(erased).length / totalBlocks) * 100)}%
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-150 ${
              color === 'blue' ? 'bg-sky-500' : 'bg-amber-500'
            }`}
            style={{ width: `${(Object.keys(erased).length / totalBlocks) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">손가락으로 쓱쓱 문질러 지우세요!</p>
      </div>
    </div>
  );
};

/* ==========================================================================
   4. Bell Chime Mission (방과후 종치기)
   ========================================================================== */
const BellChimeMission: React.FC<{
  mission: MissionState;
  onComplete: () => void;
  color: string;
}> = ({ mission, onComplete, color }) => {
  const [taps, setTaps] = useState(0);
  const requiredTaps = mission.data.requiredTaps || 15;
  const [isSwinging, setIsSwinging] = useState(false);
  const completedRef = useRef(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [mission.id]);

  const handleTap = () => {
    if (completedRef.current) return;
    if (Date.now() - mountTime.current < 400) return;
    playSound('bell');
    setIsSwinging(true);
    setTaps(prev => {
      if (completedRef.current) return prev;
      const next = prev + 1;
      if (next >= requiredTaps) {
        completedRef.current = true;
        setTimeout(() => {
          playSound('correct');
          onComplete();
        }, 100);
      }
      return next;
    });

    // Reset swing class shortly after
    setTimeout(() => setIsSwinging(false), 200);
  };

  const ringFill = color === 'blue' ? 'bg-sky-500' : 'bg-amber-500';

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none">
      <div className="text-center">
        <h4 className="text-lg font-bold text-gray-800">{mission.koreanName}</h4>
        <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
      </div>

      {/* Interactive Bell Container */}
      <div className="relative flex items-center justify-center w-52 h-52">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleTap();
          }}
          onClick={handleTap}
          className="group relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center bg-white border-4 border-yellow-400 active:scale-95 shadow-xl transition-transform"
        >
          {/* Bell visual container */}
          <motion.div
            animate={isSwinging ? { rotate: [-20, 20, -15, 15, 0] } : { rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="text-7xl drop-shadow-md select-none pointer-events-none"
          >
            🔔
          </motion.div>
          <span className="text-xs font-bold text-yellow-600 mt-2 tracking-tighter">TAP TAP!</span>
        </button>

        {/* Concentric tap blast waves */}
        <AnimatePresence>
          {isSwinging && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute w-32 h-32 rounded-full border-4 border-yellow-400 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Counter Progress */}
      <div className="w-11/12 max-w-xs text-center">
        <div className="text-lg font-extrabold text-slate-800 mb-1">
          남은 타수: <span className="text-red-500 text-2xl">{Math.max(requiredTaps - taps, 0)}</span>번
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div 
            className={`h-full transition-all duration-100 ${ringFill}`}
            style={{ width: `${(taps / requiredTaps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   5. Trash Sort Mission (교실 분리수거)
   ========================================================================== */
const TrashSortMission: React.FC<{
  mission: MissionState;
  onComplete: () => void;
  onFail: () => void;
  color: string;
}> = ({ mission, onComplete, onFail, color }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const items = mission.data.items;
  const lastActionTime = useRef(0);
  const completedRef = useRef(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [mission.id]);

  const currentItem = items[currentIndex];

  const handleSort = (selectedType: string) => {
    if (completedRef.current) return;
    if (Date.now() - mountTime.current < 400) return;
    const now = Date.now();
    if (now - lastActionTime.current < 100) return;
    lastActionTime.current = now;

    const itemIndex = currentIndexRef.current;
    if (itemIndex >= items.length) return;
    const item = items[itemIndex];

    if (selectedType === item.type) {
      playSound('correct');
      const nextIdx = itemIndex + 1;
      currentIndexRef.current = nextIdx;
      setCurrentIndex(nextIdx);

      if (nextIdx >= items.length) {
        completedRef.current = true;
        onComplete();
      }
    } else {
      playSound('wrong');
      completedRef.current = true;
      onFail();
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none">
      <div className="text-center">
        <h4 className="text-lg font-bold text-gray-800">{mission.koreanName}</h4>
        <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
      </div>

      {/* Current Trash Item Card */}
      <div className="w-10/12 max-w-xs bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6 shadow-md text-center flex flex-col items-center justify-center">
        <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">다음 쓰레기</span>
        <motion.div 
          key={currentIndex}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl my-4 font-black text-gray-800"
        >
          {currentItem.name}
        </motion.div>
        <span className="text-xs text-zinc-500 font-medium">({currentIndex + 1}/3 완료)</span>
      </div>

      {/* 3 Sorting Bins */}
      <div className="grid grid-cols-3 gap-2 w-11/12 max-w-xs">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleSort('paper');
          }}
          onClick={() => handleSort('paper')}
          className="flex flex-col items-center justify-center py-4 px-2 bg-blue-50 border-2 border-blue-200 hover:border-blue-400 active:bg-blue-100 rounded-xl shadow-sm text-center active:scale-95 transition-all"
        >
          <span className="text-3xl mb-1">📄</span>
          <span className="text-xs font-bold text-blue-700">종이류</span>
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleSort('plastic');
          }}
          onClick={() => handleSort('plastic')}
          className="flex flex-col items-center justify-center py-4 px-2 bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 active:bg-emerald-100 rounded-xl shadow-sm text-center active:scale-95 transition-all"
        >
          <span className="text-3xl mb-1">🧴</span>
          <span className="text-xs font-bold text-emerald-700">플라스틱</span>
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleSort('metal');
          }}
          onClick={() => handleSort('metal')}
          className="flex flex-col items-center justify-center py-4 px-2 bg-amber-50 border-2 border-amber-200 hover:border-amber-400 active:bg-amber-100 rounded-xl shadow-sm text-center active:scale-95 transition-all"
        >
          <span className="text-3xl mb-1">🥫</span>
          <span className="text-xs font-bold text-amber-700">캔/고철</span>
        </button>
      </div>

      <div className="text-xs text-red-400 font-semibold">틀리면 1초간 기절! 신중히 분류하세요!</div>
    </div>
  );
};

/* ==========================================================================
   6. Locker Lock Cipher (사물함 비밀번호 - Simon Says)
   ========================================================================== */
const LockerCipherMission: React.FC<{
  mission: MissionState;
  onComplete: () => void;
  onFail: () => void;
  color: string;
}> = ({ mission, onComplete, onFail, color }) => {
  const { colors, pattern } = mission.data;
  const [userInput, setUserInput] = useState<number[]>([]);
  const userInputRef = useRef<number[]>([]);
  const [isPlayingPattern, setIsPlayingPattern] = useState(true);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const lastActionTime = useRef(0);
  const completedRef = useRef(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [mission.id]);

  // Play pattern on start or retry
  useEffect(() => {
    let active = true;
    const play = async () => {
      setIsPlayingPattern(true);
      setUserInput([]);
      userInputRef.current = [];
      completedRef.current = false;
      
      // Delay before starting pattern display
      await new Promise(resolve => setTimeout(resolve, 800));
      
      for (let i = 0; i < pattern.length; i++) {
        if (!active) return;
        const btnIdx = pattern[i];
        setActiveButton(btnIdx);
        playSound('tap');
        await new Promise(resolve => setTimeout(resolve, 450));
        setActiveButton(null);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      setIsPlayingPattern(false);
    };

    play();
    return () => {
      active = false;
    };
  }, [pattern]);

  const handleLockerBtn = (idx: number) => {
    if (isPlayingPattern) return; // ignore clicks while playing pattern
    if (completedRef.current) return;
    if (Date.now() - mountTime.current < 400) return;
    if (userInputRef.current.length >= pattern.length) return; // already matched fully

    const now = Date.now();
    if (now - lastActionTime.current < 100) return;
    lastActionTime.current = now;

    playSound('tap');
    const newInput = [...userInputRef.current, idx];
    userInputRef.current = newInput;
    setUserInput(newInput);

    // Verify current step
    const currentStepIdx = newInput.length - 1;
    if (newInput[currentStepIdx] !== pattern[currentStepIdx]) {
      playSound('wrong');
      completedRef.current = true;
      // Reset on failure
      userInputRef.current = [];
      setUserInput([]);
      onFail();
      return;
    }

    // Pattern matched fully
    if (newInput.length === pattern.length) {
      completedRef.current = true;
      setTimeout(() => {
        playSound('correct');
        onComplete();
      }, 100);
    }
  };

  const getLockerBtnClass = (idx: number) => {
    const isLit = activeButton === idx;
    const colorsMap = [
      'border-red-400 ' + (isLit ? 'bg-red-500 text-white scale-105 shadow-red-300' : 'bg-red-100 text-red-800'),
      'border-blue-400 ' + (isLit ? 'bg-blue-500 text-white scale-105 shadow-blue-300' : 'bg-blue-100 text-blue-800'),
      'border-emerald-400 ' + (isLit ? 'bg-emerald-500 text-white scale-105 shadow-emerald-300' : 'bg-emerald-100 text-emerald-800'),
      'border-yellow-400 ' + (isLit ? 'bg-yellow-500 text-white scale-105 shadow-yellow-300' : 'bg-yellow-100 text-yellow-800')
    ];
    return colorsMap[idx];
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none">
      <div className="text-center">
        <h4 className="text-lg font-bold text-gray-800">{mission.koreanName}</h4>
        <p className="text-xs text-gray-500 mt-1">
          {isPlayingPattern ? '🔐 암호 재생 중... 집중하세요!' : '👇 순서대로 암호를 입력하세요!'}
        </p>
      </div>

      {/* Locker Cryptic Safe Visual */}
      <div className="w-10/12 max-w-xs bg-stone-700 border-4 border-stone-800 rounded-3xl p-4 shadow-xl flex flex-col items-center gap-4 relative">
        <div className="absolute top-2 right-4 text-[10px] font-mono text-stone-400">POCKET LOCKER v2.0</div>
        
        {/* Passcode dots display */}
        <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 py-2 px-6 rounded-lg w-full justify-center">
          {pattern.map((_: number, i: number) => (
            <div 
              key={i}
              className={`w-3.5 h-3.5 rounded-full border border-stone-800 transition-all ${
                userInput.length > i 
                  ? 'bg-emerald-400 shadow-md shadow-emerald-400/40 animate-pulse' 
                  : 'bg-stone-800'
              }`}
            />
          ))}
        </div>

        {/* 4 button panel */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {colors.map((name: string, idx: number) => (
            <button
              key={idx}
              disabled={isPlayingPattern}
              onTouchStart={(e) => {
                if (!isPlayingPattern) {
                  e.preventDefault();
                  handleLockerBtn(idx);
                }
              }}
              onClick={() => handleLockerBtn(idx)}
              className={`py-6 px-1 rounded-2xl font-black text-center text-sm shadow-md transition-all border-2 ${getLockerBtnClass(idx)} ${
                isPlayingPattern ? 'cursor-not-allowed opacity-80' : 'active:scale-95 cursor-pointer'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500 font-bold">
        {isPlayingPattern ? '👀 화면을 주목하세요!' : `입력 현황: ${userInput.length}/${pattern.length}`}
      </div>
    </div>
  );
};

/* ==========================================================================
   7. Pencil Sharpener Mission (연필 깎기 - 버튼 연타)
   ========================================================================== */
const PencilSharpenMission: React.FC<{
  mission: MissionState;
  onComplete: () => void;
  color: string;
  btnCol: string;
}> = ({ mission, onComplete, color, btnCol }) => {
  const [spins, setSpins] = useState(0);
  const requiredSpins = mission.data.requiredSpins || 12;
  const completedRef = useRef(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [mission.id]);

  const handleSpin = () => {
    if (completedRef.current) return;
    if (Date.now() - mountTime.current < 400) return;
    playSound('tap');
    setSpins(prev => {
      if (completedRef.current) return prev;
      const next = prev + 1;
      if (next >= requiredSpins) {
        completedRef.current = true;
        setTimeout(() => {
          playSound('correct');
          onComplete();
        }, 100);
      }
      return next;
    });
  };

  const pencilLengthPercent = Math.max(100 - (spins / requiredSpins) * 50, 50);

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none">
      <div className="text-center">
        <h4 className="text-lg font-bold text-gray-800">{mission.koreanName}</h4>
        <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
      </div>

      {/* Sharpener Visual Area */}
      <div className="w-11/12 max-w-xs flex flex-col items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl py-6 relative overflow-hidden">
        
        {/* The Pencil */}
        <div className="flex items-center gap-1 mb-8">
          <div 
            className="h-6 bg-amber-400 border border-amber-500 rounded-l-md transition-all duration-150 relative"
            style={{ width: `${pencilLengthPercent * 1.5}px` }}
          >
            {/* Pencil design lines */}
            <div className="absolute inset-x-0 top-1 h-1 bg-amber-500/20" />
            <div className="absolute inset-x-0 bottom-1 h-1 bg-amber-500/20" />
          </div>
          {/* Wood core cone */}
          <div className="w-0 h-0 border-y-[12px] border-y-transparent border-l-[24px] border-l-orange-200" />
          {/* Graphite lead tip */}
          <div 
            className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[16px] transition-all duration-150"
            style={{ 
              borderLeftColor: spins >= requiredSpins ? '#1e293b' : '#94a3b8' 
            }}
          />
        </div>

        {/* Sharpener Body (where pencil goes) */}
        <div className="relative flex items-center justify-center">
          <motion.div 
            animate={{ rotate: spins * 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-24 h-24 bg-sky-600 border-4 border-sky-700 rounded-full flex items-center justify-center shadow-md relative z-10"
          >
            <div className="w-8 h-8 bg-zinc-800 rounded-full border-2 border-zinc-950 flex items-center justify-center">
              <div className="w-4 h-4 bg-zinc-900 rounded-full" />
            </div>
            {/* Rotating handles */}
            <div className="absolute top-1 w-2 h-4 bg-sky-800 rounded-md" />
            <div className="absolute bottom-1 w-2 h-4 bg-sky-800 rounded-md" />
          </motion.div>
        </div>
      </div>

      {/* Button to mash */}
      <div className="w-11/12 max-w-xs text-center flex flex-col gap-2">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleSpin();
          }}
          onClick={handleSpin}
          className={`w-full py-4 rounded-2xl text-xl font-bold text-white shadow-md active:scale-95 transition-all ${btnCol}`}
        >
          ✏️ 깎기 연타! ({spins}/{requiredSpins})
        </button>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-150"
            style={{ width: `${(spins / requiredSpins) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   8. Catch the Classroom Flies (파리 소탕작전)
   ========================================================================== */
const CatchFliesMission: React.FC<{
  mission: MissionState;
  onComplete: () => void;
  color: string;
}> = ({ mission, onComplete, color }) => {
  const initialFlies = mission.data.flies;
  const [flies, setFlies] = useState<any[]>(initialFlies);
  const [deadCount, setDeadCount] = useState(0);
  const completedRef = useRef(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [mission.id]);

  const handleFlyTap = (id: number) => {
    if (completedRef.current) return;
    if (Date.now() - mountTime.current < 400) return;
    playSound('tap');
    setFlies(prev => prev.filter(f => f.id !== id));
    setDeadCount(prev => {
      if (completedRef.current) return prev;
      const next = prev + 1;
      if (next >= initialFlies.length) {
        completedRef.current = true;
        setTimeout(() => {
          playSound('correct');
          onComplete();
        }, 100);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none">
      <div className="text-center">
        <h4 className="text-lg font-bold text-gray-800">{mission.koreanName}</h4>
        <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
      </div>

      {/* Screen Area to catch flies */}
      <div className="w-11/12 max-w-xs aspect-square bg-sky-50/50 border-2 border-dashed border-sky-200 rounded-2xl relative overflow-hidden shadow-inner">
        {flies.map((fly) => (
          <motion.button
            key={fly.id}
            onTouchStart={(e) => {
              e.preventDefault();
              handleFlyTap(fly.id);
            }}
            onClick={() => handleFlyTap(fly.id)}
            style={{ 
              position: 'absolute',
              left: `${fly.x}%`,
              top: `${fly.y}%`,
            }}
            animate={{
              x: [0, Math.sin(fly.id) * 15, Math.cos(fly.id) * 15, 0],
              y: [0, Math.cos(fly.id) * 15, Math.sin(fly.id) * 15, 0]
            }}
            transition={{
              duration: fly.speed,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="text-3xl active:scale-75 transition-all p-2 focus:outline-none"
          >
            🪰
          </motion.button>
        ))}

        {flies.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center font-bold text-green-500">
            모든 파리 소탕 완료! 🧹
          </div>
        )}
      </div>

      <div className="text-sm font-bold text-slate-600">
        퇴치한 파리: <span className="text-red-500 text-lg">{deadCount}</span> / {initialFlies.length}마리
      </div>
    </div>
  );
};

/* ==========================================================================
   9. School Lunch Tray Mission (급식 배식하기)
   ========================================================================== */
const LunchTrayMission: React.FC<{
  mission: MissionState;
  onComplete: () => void;
  onFail: () => void;
  color: string;
}> = ({ mission, onComplete, onFail, color }) => {
  const { targetMenu, choices } = mission.data;
  const [served, setServed] = useState<any[]>([]);
  const servedRef = useRef<any[]>([]);
  const lastActionTime = useRef(0);
  const completedRef = useRef(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [mission.id]);

  const handleChoice = (food: any) => {
    if (completedRef.current) return;
    if (Date.now() - mountTime.current < 400) return;
    const now = Date.now();
    if (now - lastActionTime.current < 100) return;
    lastActionTime.current = now;

    const nextIndex = servedRef.current.length;
    if (nextIndex >= targetMenu.length) return;
    const expectedFood = targetMenu[nextIndex];

    if (food.type === expectedFood.type) {
      playSound('correct');
      const newServed = [...servedRef.current, food];
      servedRef.current = newServed;
      setServed(newServed);

      if (newServed.length === targetMenu.length) {
        completedRef.current = true;
        setTimeout(() => {
          onComplete();
        }, 150);
      }
    } else {
      playSound('wrong');
      completedRef.current = true;
      onFail();
    }
  };

  const trayBorder = color === 'blue' ? 'border-sky-200' : 'border-amber-200';

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none">
      <div className="text-center">
        <h4 className="text-lg font-bold text-gray-800">{mission.koreanName}</h4>
        <p className="text-xs text-gray-500 mt-1">식판 아래의 배식 도우미가 요청하는 반찬을 터치하세요!</p>
      </div>

      {/* Cafeteria Meal Tray */}
      <div className={`w-11/12 max-w-xs bg-slate-100 border-4 ${trayBorder} rounded-3xl p-4 shadow-lg flex flex-col gap-3 relative`}>
        <div className="text-center text-[10px] font-bold text-slate-400">TODAY LUNCH MEAL TRAY</div>

        {/* Tray Rows */}
        <div className="grid grid-cols-3 gap-2">
          {targetMenu.map((item: any, i: number) => {
            const isServed = served.length > i;
            return (
              <div 
                key={i}
                className={`aspect-square bg-slate-200 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 relative transition-all ${
                  isServed ? 'bg-white border-solid border-slate-300 scale-100' : 'opacity-80'
                }`}
              >
                {isServed ? (
                  <motion.div 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl">{item.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">{item.name.split(' ')[1]}</span>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center text-center p-1">
                    <span className="text-[10px] text-gray-400 font-bold">대기 중</span>
                    <span className="text-[8px] text-gray-400 mt-1 font-mono">{item.name.split(' ')[1]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Prompt Signboard */}
        {served.length < targetMenu.length && (
          <div className="bg-amber-100 border border-amber-200 p-2 rounded-xl text-center">
            <span className="text-xs font-bold text-amber-800">
              👉 <span className="text-red-500 font-extrabold">{targetMenu[served.length].name.split(' ')[1]}</span> 담아주세요!
            </span>
          </div>
        )}
      </div>

      {/* Choice Options */}
      <div className="grid grid-cols-3 gap-2 w-11/12 max-w-xs">
        {choices.map((food: any, idx: number) => {
          const alreadyPlaced = served.some(s => s.type === food.type);
          return (
            <button
              key={idx}
              disabled={alreadyPlaced}
              onTouchStart={(e) => {
                if (!alreadyPlaced) {
                  e.preventDefault();
                  handleChoice(food);
                }
              }}
              onClick={() => handleChoice(food)}
              className={`flex flex-col items-center justify-center p-2 bg-white border-2 border-slate-200 hover:border-slate-400 rounded-xl shadow-sm text-center active:scale-95 transition-all ${
                alreadyPlaced ? 'opacity-30 cursor-not-allowed scale-95' : 'cursor-pointer'
              }`}
            >
              <span className="text-3xl">{food.name.split(' ')[0]}</span>
              <span className="text-[10px] font-bold text-gray-600 mt-1">{food.name.split(' ')[1]}</span>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-slate-400 font-bold">오배식 시 1초 기절 페널티 발생!</div>
    </div>
  );
};

/* ==========================================================================
   10. Ascending Numbers Mission (교실 탈출 비밀번호)
   ========================================================================== */
const AscendingNumbersMission: React.FC<{
  mission: MissionState;
  onComplete: () => void;
  onFail: () => void;
  color: string;
}> = ({ mission, onComplete, onFail, color }) => {
  const { shuffled, sorted } = mission.data;
  const [clickedSet, setClickedSet] = useState<Set<number>>(new Set());
  const clickedSetRef = useRef<Set<number>>(new Set());
  const lastActionTime = useRef(0);
  const completedRef = useRef(false);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [mission.id]);

  const handleNumClick = (num: number) => {
    if (completedRef.current) return;
    if (Date.now() - mountTime.current < 400) return;
    if (clickedSetRef.current.has(num)) return; // already clicked
    if (clickedSetRef.current.size >= sorted.length) return; // already completed

    const now = Date.now();
    if (now - lastActionTime.current < 100) return;
    lastActionTime.current = now;

    const currentTargetNum = sorted[clickedSetRef.current.size];

    if (num === currentTargetNum) {
      playSound('correct');
      clickedSetRef.current.add(num);
      const nextSet = new Set(clickedSetRef.current);
      setClickedSet(nextSet);

      if (nextSet.size === sorted.length) {
        completedRef.current = true;
        setTimeout(() => {
          onComplete();
        }, 150);
      }
    } else {
      playSound('wrong');
      completedRef.current = true;
      onFail();
    }
  };

  const activeBtnStyle = color === 'blue' 
    ? 'bg-sky-500 border-sky-600 text-white shadow-sky-200' 
    : 'bg-amber-500 border-amber-600 text-white shadow-amber-200';

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none">
      <div className="text-center">
        <h4 className="text-lg font-bold text-gray-800">{mission.koreanName}</h4>
        <p className="text-xs text-gray-500 mt-1">{mission.description}</p>
      </div>

      {/* Cards layout */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-11/12 max-w-xs py-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
        {shuffled.map((num: number, idx: number) => {
          const isClicked = clickedSet.has(num);
          return (
            <button
              key={idx}
              onTouchStart={(e) => {
                if (!isClicked) {
                  e.preventDefault();
                  handleNumClick(num);
                }
              }}
              onClick={() => handleNumClick(num)}
              className={`w-14 h-20 rounded-xl font-mono text-xl font-black border-2 flex items-center justify-center shadow-md active:scale-90 transition-all ${
                isClicked 
                  ? 'bg-stone-300 border-stone-400 text-stone-500 cursor-not-allowed scale-95 opacity-50' 
                  : 'bg-white border-slate-300 text-slate-800 hover:border-slate-500'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Hint order visualization */}
      <div className="w-11/12 max-w-xs flex flex-col items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
          현재 타겟: 
          <span className="text-red-500 font-extrabold text-sm ml-1">
            {clickedSet.size < sorted.length ? sorted[clickedSet.size] : '완료!'}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-stone-100 py-1.5 px-3 rounded-xl w-full justify-center">
          {sorted.map((num: number, i: number) => (
            <React.Fragment key={i}>
              <span className={`font-mono text-xs font-extrabold ${clickedSet.has(num) ? 'text-green-500 line-through' : 'text-slate-400'}`}>
                {num}
              </span>
              {i < sorted.length - 1 && <span className="text-slate-300 text-[10px]">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
