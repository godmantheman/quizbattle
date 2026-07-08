import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Play, RotateCcw, Monitor, RefreshCw, 
  Volume2, VolumeX, Sparkles, User, Info, Timer, Clock, 
  CheckCircle, Zap, ShieldAlert, Award, Star, Cpu, Bot
} from 'lucide-react';
import { playSound } from './utils/sound';
import { generateMissionsForPlayer } from './utils/missionGenerator';
import { MissionRenderer } from './components/Missions';
import { AILiveSimulator } from './components/AILiveSimulator';
import { PlayerState, GamePhase, ScreenOrientation, Difficulty, AIDifficulty, GameMode } from './types';

const AVATARS = [
  { emoji: '🐯', name: '호랑이' },
  { emoji: '🦊', name: '여우' },
  { emoji: '🐼', name: '판다' },
  { emoji: '🐶', name: '강아지' },
  { emoji: '🐱', name: '고양이' },
  { emoji: '🐰', name: '토끼' },
];

function getAIComments(mName: string, difficulty: Difficulty): string[] {
  switch (mName) {
    case 'palm_scan':
      return ["🤖 AI: 손바닥 스캔하는 중...", "🤖 AI: 지문 인식 센서 밀착...", "🤖 AI: 꾹 누르고 있는 중... ✋"];
    case 'gugudan':
      return ["🤖 AI: 음... 곱셈 구구를 해 보자...", "🤖 AI: 정답 번호 탐색 완료!", "🤖 AI: 구구단 외우는 중... 🔢"];
    case 'erase_chalk':
      return ["🤖 AI: 칠판 문지르는 중...", "🤖 AI: 지우개로 슥슥 지우는 중...", "🤖 AI: 깨끗이 청소 중... 🧼"];
    case 'bell_chime':
      return ["🤖 AI: 종을 마구 때리는 중!", "🤖 AI: 댕댕댕 소리가 울린다! 🔔", "🤖 AI: 쾌속 터치 탭탭!"];
    case 'trash_sort':
      return ["🤖 AI: 페트병은 플라스틱...", "🤖 AI: 공책은 종이 분리수거!", "🤖 AI: 분리배출 분류 완료... ♻️"];
    case 'locker_cipher':
      return ["🤖 AI: 컬러 순서 외우는 중...", "🤖 AI: 버튼 순서대로 누르는 중!", "🤖 AI: 암호 대조 완료... 🔐"];
    case 'pencil_sharpen':
      return ["🤖 AI: 연필 깎기 마구 연타 중!", "🤖 AI: 연필이 뾰족해지고 있습니다! ✏️", "🤖 AI: 회전 수 채우는 중!"];
    case 'catch_flies':
      return ["🤖 AI: 파리 조준 중...", "🤖 AI: 날아다니는 파리를 챱! 🪰", "🤖 AI: 파리채 소탕 완료!"];
    case 'lunch_tray':
      return ["🤖 AI: 밥 옆에 국 담기...", "🤖 AI: 맛있는 닭강정 배식하기! 🍱", "🤖 AI: 식판 세팅하는 중!"];
    case 'ascending_numbers':
      return ["🤖 AI: 숫자 크기 비교 중...", "🤖 AI: 오름차순으로 정렬해서 터치! 🚪", "🤖 AI: 탈출 코드 계산 성공!"];
    case 'card_matching':
      return ["🤖 AI: 카드 페어 뒤집는 중...", "🤖 AI: 똑같은 학교 물건 매칭 가동! 🏫", "🤖 AI: 정답 카드 발견!"];
    case 'pop_balloons':
      return ["🤖 AI: 둥둥 뜨는 풍선 터뜨리기!", "🤖 AI: 🎈 풍선 하나 조준 완료!", "🤖 AI: 펑! 펑! 신나게 터뜨리는 중!"];
    default:
      return ["🤖 AI: 미션 푸는 중..."];
  }
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [orientation, setOrientation] = useState<ScreenOrientation>('horizontal');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [gameMode, setGameMode] = useState<GameMode>('1v1');
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);

  // Difficulty & Custom counts
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('normal');
  const [gameCount, setGameCount] = useState<number>(10);

  // AI bot visualization log & percent
  const [aiProgressPercent, setAiProgressPercent] = useState<number>(0);
  const [aiLog, setAiLog] = useState<string>('🤖 AI: 미션 준비 완료!');

  // Player state
  const [p1, setP1] = useState<PlayerState>({
    id: 1,
    name: '플레이어 1',
    color: 'blue',
    score: 0,
    currentMissionIndex: 0,
    missions: [],
    totalTime: 0,
    completedAt: null,
    missionDurations: []
  });

  const [p2, setP2] = useState<PlayerState>({
    id: 2,
    name: '플레이어 2',
    color: 'orange',
    score: 0,
    currentMissionIndex: 0,
    missions: [],
    totalTime: 0,
    completedAt: null,
    missionDurations: []
  });

  // Chosen avatars
  const [p1Avatar, setP1Avatar] = useState(AVATARS[0]);
  const [p2Avatar, setP2Avatar] = useState(AVATARS[1]);

  // Timers
  const startTime = useRef<number>(0);
  const p1MissionStart = useRef<number>(0);
  const p2MissionStart = useRef<number>(0);

  // Stun penalties
  const [p1Stunned, setP1Stunned] = useState(false);
  const [p2Stunned, setP2Stunned] = useState(false);

  // Start countdown trigger
  const handleStartGame = () => {
    // Generate a random order of mission names including new mini games
    const missionNames = [
      'palm_scan', 'gugudan', 'erase_chalk', 'bell_chime', 
      'trash_sort', 'locker_cipher', 'pencil_sharpen', 
      'catch_flies', 'lunch_tray', 'ascending_numbers',
      'card_matching', 'pop_balloons'
    ];
    const shuffledNames = [...missionNames].sort(() => Math.random() - 0.5);
    const slicedNames = shuffledNames.slice(0, gameCount);

    // Generate missions in the identical shuffled order for both players
    const p1Missions = generateMissionsForPlayer(slicedNames, difficulty);
    const p2Missions = generateMissionsForPlayer(slicedNames, difficulty);

    setP1(prev => ({
      ...prev,
      score: 0,
      currentMissionIndex: 0,
      missions: p1Missions,
      completedAt: null,
      missionDurations: []
    }));

    setP2(prev => ({
      ...prev,
      name: gameMode === 'ai' ? `AI 봇 (${p2Avatar.name})` : '플레이어 2',
      score: 0,
      currentMissionIndex: 0,
      missions: p2Missions,
      completedAt: null,
      missionDurations: []
    }));

    setCountdown(3);
    setPhase('countdown');
    if (soundEnabled) playSound('countdown');
  };

  // Countdown timer loop
  useEffect(() => {
    if (phase === 'countdown') {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setPhase('playing');
            startTime.current = Date.now();
            p1MissionStart.current = Date.now();
            p2MissionStart.current = Date.now();
            if (soundEnabled) playSound('start');
            return 0;
          } else {
            if (soundEnabled) playSound('countdown');
            return prev - 1;
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, soundEnabled]);

  // Game playing loop to track total running time
  const [elapsedTime, setElapsedTime] = useState(0);
  useEffect(() => {
    if (phase === 'playing') {
      const interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime.current) / 1000);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // AI Bot Solver Loop
  useEffect(() => {
    if (phase === 'playing' && gameMode === 'ai' && p2.currentMissionIndex < p2.missions.length) {
      const currentIdx = p2.currentMissionIndex;
      const currentMission = p2.missions[currentIdx];
      
      const getAISolveTime = (mName: string) => {
        let baseSec = 4.0;
        switch (mName) {
          case 'palm_scan': 
            baseSec = difficulty === 'easy' ? 2.0 : difficulty === 'normal' ? 3.0 : difficulty === 'hard' ? 4.2 : 5.8; 
            break;
          case 'gugudan': 
            baseSec = difficulty === 'easy' ? 2.5 : difficulty === 'normal' ? 4.2 : difficulty === 'hard' ? 7.5 : 12.0; 
            break;
          case 'erase_chalk': 
            baseSec = difficulty === 'easy' ? 2.5 : difficulty === 'normal' ? 4.0 : difficulty === 'hard' ? 6.0 : 8.5; 
            break;
          case 'bell_chime': 
            baseSec = difficulty === 'easy' ? 2.0 : difficulty === 'normal' ? 3.2 : difficulty === 'hard' ? 5.2 : 7.5; 
            break;
          case 'trash_sort': 
            baseSec = difficulty === 'easy' ? 2.2 : difficulty === 'normal' ? 3.8 : difficulty === 'hard' ? 5.8 : 8.2; 
            break;
          case 'locker_cipher': 
            baseSec = difficulty === 'easy' ? 3.0 : difficulty === 'normal' ? 4.5 : difficulty === 'hard' ? 6.5 : 9.0; 
            break;
          case 'pencil_sharpen': 
            baseSec = difficulty === 'easy' ? 2.0 : difficulty === 'normal' ? 3.0 : difficulty === 'hard' ? 5.0 : 7.2; 
            break;
          case 'catch_flies': 
            baseSec = difficulty === 'easy' ? 2.5 : difficulty === 'normal' ? 4.2 : difficulty === 'hard' ? 6.5 : 9.2; 
            break;
          case 'lunch_tray': 
            baseSec = difficulty === 'easy' ? 2.0 : difficulty === 'normal' ? 3.5 : difficulty === 'hard' ? 5.2 : 7.5; 
            break;
          case 'ascending_numbers': 
            baseSec = difficulty === 'easy' ? 2.5 : difficulty === 'normal' ? 4.8 : difficulty === 'hard' ? 7.2 : 10.0; 
            break;
          case 'card_matching': 
            baseSec = difficulty === 'easy' ? 3.2 : difficulty === 'normal' ? 5.5 : difficulty === 'hard' ? 8.0 : 12.0; 
            break;
          case 'pop_balloons': 
            baseSec = difficulty === 'easy' ? 2.5 : difficulty === 'normal' ? 4.2 : difficulty === 'hard' ? 6.8 : 9.5; 
            break;
        }

        let multiplier = 1.0;
        if (aiDifficulty === 'easy') multiplier = 1.7;
        else if (aiDifficulty === 'normal') multiplier = 1.0;
        else if (aiDifficulty === 'hard') multiplier = 0.65;
        else multiplier = 0.40; // nightmare AI (super fast)

        const noise = (Math.random() - 0.5) * 0.6;
        return Math.max(1.0, (baseSec * multiplier) + noise) * 1000;
      };

      const solveTime = getAISolveTime(currentMission.name);

      // AI solving state - we set progress ticks for visual representation
      let elapsed = 0;
      const intervalTime = 100;
      const interval = setInterval(() => {
        elapsed += intervalTime;
        setAiProgressPercent(Math.min((elapsed / solveTime) * 100, 100));
        
        // Randomly simulate comments
        if (Math.random() < 0.15 && elapsed < solveTime - 500) {
          const comments = getAIComments(currentMission.name, difficulty);
          setAiLog(comments[Math.floor(Math.random() * comments.length)]);
        }
      }, intervalTime);

      const timer = setTimeout(() => {
        clearInterval(interval);
        handleMissionComplete(2, currentIdx);
      }, solveTime);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [phase, gameMode, p2.currentMissionIndex, difficulty, aiDifficulty]);

  // Complete mission logic
  const handleMissionComplete = (playerId: 1 | 2, completedIndex: number) => {
    const now = Date.now();
    
    if (playerId === 1) {
      const duration = (now - p1MissionStart.current) / 1000;
      setP1(prev => {
        if (completedIndex !== prev.currentMissionIndex) {
          return prev;
        }
        const nextIdx = prev.currentMissionIndex + 1;
        const nextDurations = [...prev.missionDurations, duration];
        const isGameFinished = nextIdx >= prev.missions.length;

        p1MissionStart.current = now;

        if (isGameFinished) {
          const finishedAt = now;
          const totalTime = (finishedAt - startTime.current) / 1000;

          if (gameMode === 'single' || prev.completedAt !== null || p2.completedAt !== null || nextIdx >= prev.missions.length) {
            if (soundEnabled) playSound('victory');
            setTimeout(() => setPhase('gameover'), 800);
          }

          return {
            ...prev,
            score: nextIdx,
            currentMissionIndex: nextIdx,
            completedAt: finishedAt,
            totalTime,
            missionDurations: nextDurations
          };
        }

        return {
          ...prev,
          score: nextIdx,
          currentMissionIndex: nextIdx,
          missionDurations: nextDurations
        };
      });
    } else {
      // Player 2 / AI
      if (gameMode === 'single') return;

      const duration = (now - p2MissionStart.current) / 1000;
      setP2(prev => {
        if (completedIndex !== prev.currentMissionIndex) {
          return prev;
        }
        const nextIdx = prev.currentMissionIndex + 1;
        const nextDurations = [...prev.missionDurations, duration];
        const isGameFinished = nextIdx >= prev.missions.length;

        p2MissionStart.current = now;

        if (isGameFinished) {
          const finishedAt = now;
          const totalTime = (finishedAt - startTime.current) / 1000;

          if (soundEnabled) playSound('victory');
          setTimeout(() => setPhase('gameover'), 800);

          return {
            ...prev,
            score: nextIdx,
            currentMissionIndex: nextIdx,
            completedAt: finishedAt,
            totalTime,
            missionDurations: nextDurations
          };
        }

        return {
          ...prev,
          score: nextIdx,
          currentMissionIndex: nextIdx,
          missionDurations: nextDurations
        };
      });
    }
  };

  // Fail/Wrong Penalty stun logic
  const handleMissionFail = (playerId: 1 | 2, failedIndex: number) => {
    if (playerId === 1) {
      if (failedIndex !== p1.currentMissionIndex) return;
      if (p1Stunned) return;
      setP1Stunned(true);
      setTimeout(() => setP1Stunned(false), 1000);
    } else {
      if (failedIndex !== p2.currentMissionIndex) return;
      if (p2Stunned) return;
      setP2Stunned(true);
      setTimeout(() => setP2Stunned(false), 1000);
    }
  };

  // Winner Decision helper
  const getWinnerInfo = () => {
    if (gameMode === 'single') {
      return { winner: 1, text: '기록 측정 완료!', emoji: p1Avatar.emoji };
    }

    if (gameMode === 'ai') {
      if (p1.completedAt && p2.completedAt) {
        return p1.completedAt < p2.completedAt
          ? { winner: 1, text: `🎉 AI를 꺾었습니다! 플레이어 1 승리!`, emoji: p1Avatar.emoji }
          : { winner: 2, text: `🤖 AI 봇이 먼저 완주했습니다!`, emoji: '🤖' };
      }
      if (p1.completedAt) {
        return { winner: 1, text: `🎉 AI를 꺾었습니다! 플레이어 1 승리!`, emoji: p1Avatar.emoji };
      }
      if (p2.completedAt) {
        return { winner: 2, text: `🤖 AI 봇이 먼저 완주했습니다!`, emoji: '🤖' };
      }
    }

    if (p1.completedAt && p2.completedAt) {
      return p1.completedAt < p2.completedAt
        ? { winner: 1, text: `${p1Avatar.emoji} 플레이어 1 승리!`, emoji: p1Avatar.emoji }
        : { winner: 2, text: `${p2Avatar.emoji} 플레이어 2 승리!`, emoji: p2Avatar.emoji };
    }

    if (p1.completedAt) {
      return { winner: 1, text: `${p1Avatar.emoji} 플레이어 1 승리!`, emoji: p1Avatar.emoji };
    }

    if (p2.completedAt) {
      return { winner: 2, text: `${p2Avatar.emoji} 플레이어 2 승리!`, emoji: p2Avatar.emoji };
    }

    return { winner: 1, text: '무승부!', emoji: '🏁' };
  };

  const p1ProgressPercent = p1.missions.length ? Math.min((p1.currentMissionIndex / p1.missions.length) * 100, 100) : 0;
  const p2ProgressPercent = p2.missions.length ? Math.min((p2.currentMissionIndex / p2.missions.length) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between overflow-hidden relative">
      
      {/* Sound & Configuration Header */}
      <header className="absolute top-2 right-2 z-50 flex items-center gap-3">
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            playSound('tap');
          }}
          className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-2.5 rounded-full shadow-lg transition-all"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
        </button>
        {phase === 'playing' && (
          <button
            onClick={() => {
              playSound('tap');
              setShowForfeitConfirm(true);
            }}
            className="bg-red-950/80 hover:bg-red-900/80 border border-red-800/50 py-1.5 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold text-red-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            포기하기
          </button>
        )}
      </header>

      {/* Forfeit Confirmation Modal overlay */}
      {showForfeitConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">게임을 포기하시겠습니까?</h3>
              <p className="text-xs text-slate-400 mt-1">지금까지의 기록이 모두 지워지고 대기실로 돌아갑니다.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full mt-2">
              <button
                onClick={() => {
                  playSound('tap');
                  setShowForfeitConfirm(false);
                }}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
              >
                계속 하기
              </button>
              <button
                onClick={() => {
                  playSound('tap');
                  setShowForfeitConfirm(false);
                  setPhase('lobby');
                  // Completely reset state
                  setP1(prev => ({
                    ...prev,
                    score: 0,
                    currentMissionIndex: 0,
                    missions: [],
                    completedAt: null,
                    missionDurations: []
                  }));
                  setP2(prev => ({
                    ...prev,
                    score: 0,
                    currentMissionIndex: 0,
                    missions: [],
                    completedAt: null,
                    missionDurations: []
                  }));
                }}
                className="py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all"
              >
                포기하기
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main phase Router */}
      <main className="flex-grow w-full flex flex-col h-full items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* ==========================================
              LOBBY SCREEN
              ========================================== */}
          {phase === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl px-6 py-6 flex flex-col items-center justify-center text-center gap-5 overflow-y-auto max-h-[96vh]"
            >
              <div className="flex flex-col items-center gap-1.5">
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full shadow-md animate-bounce">
                  ✨ LG 스탠바이미 2 최적화 1v1 & AI 배틀
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                  방과후 스피드 레이스
                </h1>
                <p className="text-xs text-slate-400 max-w-md">
                  3초 카운트가 끝나면 신들린 터치로 미션을 가장 빠르게 클리어하세요!
                </p>
              </div>

              {/* Mode Selection (3 Columns) */}
              <div className="grid grid-cols-3 gap-2.5 w-full max-w-lg mt-1">
                <button
                  onClick={() => {
                    setGameMode('1v1');
                    playSound('tap');
                  }}
                  className={`py-3 px-2 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                    gameMode === '1v1'
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-400/10 scale-105'
                      : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Trophy className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-xs">2인 경쟁 (1v1)</span>
                  <span className="text-[9px] text-slate-500">화면 분할 대결</span>
                </button>

                <button
                  onClick={() => {
                    setGameMode('ai');
                    playSound('tap');
                  }}
                  className={`py-3 px-2 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                    gameMode === 'ai'
                      ? 'border-violet-400 bg-violet-950/40 text-violet-200 shadow-md shadow-violet-400/10 scale-105'
                      : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Cpu className="w-5 h-5 text-violet-400" />
                  <span className="font-bold text-xs">AI 대전</span>
                  <span className="text-[9px] text-slate-500">인공지능 봇 대결</span>
                </button>

                <button
                  onClick={() => {
                    setGameMode('single');
                    playSound('tap');
                  }}
                  className={`py-3 px-2 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                    gameMode === 'single'
                      ? 'border-amber-400 bg-amber-950/40 text-amber-200 shadow-md shadow-amber-400/10 scale-105'
                      : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Timer className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-xs">1인 타임어택</span>
                  <span className="text-[9px] text-slate-500">혼자서 스피드런</span>
                </button>
              </div>

              {/* Game difficulty selector */}
              <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-2xl w-full max-w-lg flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 justify-center">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  미션 문제 난이도 설정
                </div>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {(['easy', 'normal', 'hard', 'nightmare'] as const).map((diff) => {
                    const label = 
                      diff === 'easy' ? '쉬움' :
                      diff === 'normal' ? '보통' :
                      diff === 'hard' ? '어려움' : '지옥';
                    const hoverClass = 
                      diff === 'easy' ? 'hover:border-green-500 hover:text-green-300' :
                      diff === 'normal' ? 'hover:border-sky-500 hover:text-sky-300' :
                      diff === 'hard' ? 'hover:border-orange-500 hover:text-orange-300' : 'hover:border-red-500 hover:text-red-300';
                    const activeClass = 
                      diff === 'easy' ? 'border-green-500 bg-green-950/40 text-green-300 font-black' :
                      diff === 'normal' ? 'border-sky-500 bg-sky-950/40 text-sky-300 font-black' :
                      diff === 'hard' ? 'border-orange-500 bg-orange-950/40 text-orange-300 font-black' :
                      diff === 'nightmare' ? 'border-red-500 bg-red-950/40 text-red-400 font-black' : '';
                    return (
                      <button
                        key={diff}
                        onClick={() => {
                          setDifficulty(diff);
                          playSound('tap');
                        }}
                        className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${
                          difficulty === diff ? activeClass : `border-slate-800 bg-transparent text-slate-500 ${hoverClass}`
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Game Count Selector */}
              <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-2xl w-full max-w-lg flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 justify-center">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  미니게임 수 조정
                </div>
                <div className="grid grid-cols-5 gap-1.5 mt-1">
                  {([3, 5, 8, 10, 12] as const).map((count) => {
                    return (
                      <button
                        key={count}
                        onClick={() => {
                          setGameCount(count);
                          playSound('tap');
                        }}
                        className={`py-2 px-1 rounded-xl border text-xs font-extrabold transition-all ${
                          gameCount === count
                            ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                            : 'border-slate-800 bg-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {count === 12 ? '전체 (12)' : `${count}개`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Difficulty Selector (only visible in AI mode) */}
              {gameMode === 'ai' && (
                <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-2xl w-full max-w-lg flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 justify-center">
                    <Cpu className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                    상대 AI 봇 인공지능 난이도 설정
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {(['easy', 'normal', 'hard', 'nightmare'] as const).map((diff) => {
                      const label = 
                        diff === 'easy' ? '이지' :
                        diff === 'normal' ? '노말' :
                        diff === 'hard' ? '하드' : '지옥';
                      const activeClass = 
                        diff === 'easy' ? 'border-violet-500 bg-violet-950/40 text-violet-300 font-bold' :
                        diff === 'normal' ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 font-bold' :
                        diff === 'hard' ? 'border-fuchsia-500 bg-fuchsia-950/40 text-fuchsia-300 font-bold' :
                        diff === 'nightmare' ? 'border-rose-500 bg-rose-950/40 text-rose-300 font-bold' : '';
                      return (
                        <button
                          key={diff}
                          onClick={() => {
                            setAiDifficulty(diff);
                            playSound('tap');
                          }}
                          className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${
                            aiDifficulty === diff ? activeClass : 'border-slate-800 bg-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {label} AI
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Screen Orientation Settings (For LG StanbyME 2 rotate feature, hide in single) */}
              {gameMode !== 'single' && (
                <div className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-2xl w-full max-w-lg flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 justify-center">
                    <Monitor className="w-3.5 h-3.5 text-sky-400" />
                    스탠바이미 2 화면 회전 분할 설정
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      onClick={() => {
                        setOrientation('horizontal');
                        playSound('tap');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        orientation === 'horizontal'
                          ? 'border-sky-400 bg-sky-950/40 text-sky-300'
                          : 'border-slate-800 bg-transparent text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      좌우 분할 (가로형)
                    </button>
                    <button
                      onClick={() => {
                        setOrientation('vertical');
                        playSound('tap');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        orientation === 'vertical'
                          ? 'border-sky-400 bg-sky-950/40 text-sky-300'
                          : 'border-slate-800 bg-transparent text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      상하 분할 (세로형)
                    </button>
                  </div>
                </div>
              )}

              {/* Character Setup */}
              <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl w-full max-w-lg flex flex-col gap-3.5">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">캐릭터(아바타) 선택</span>
                
                {/* Player 1 Selection */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-sky-300 font-bold justify-center">
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                    플레이어 1 아바타
                  </div>
                  <div className="flex justify-center gap-2 overflow-x-auto pb-1">
                    {AVATARS.map((av) => (
                      <button
                        key={av.name}
                        onClick={() => {
                          setP1Avatar(av);
                          playSound('tap');
                        }}
                        className={`text-2xl p-2 rounded-xl border-2 transition-all ${
                          p1Avatar.name === av.name 
                            ? 'border-sky-500 bg-sky-950/40 scale-105 shadow-md shadow-sky-500/20' 
                            : 'border-slate-800 bg-transparent opacity-60 hover:opacity-100 hover:border-slate-700'
                        }`}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player 2 Selection (only if 1v1 or AI) */}
                {gameMode !== 'single' && (
                  <div className="flex flex-col gap-1.5 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold justify-center">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      {gameMode === 'ai' ? '상대 AI 아바타' : '플레이어 2 아바타'}
                    </div>
                    <div className="flex justify-center gap-2 overflow-x-auto pb-1">
                      {AVATARS.map((av) => (
                        <button
                          key={av.name}
                          onClick={() => {
                            setP2Avatar(av);
                            playSound('tap');
                          }}
                          className={`text-2xl p-2 rounded-xl border-2 transition-all ${
                            p2Avatar.name === av.name 
                              ? 'border-amber-500 bg-amber-950/40 scale-105 shadow-md shadow-amber-500/20' 
                              : 'border-slate-800 bg-transparent opacity-60 hover:opacity-100 hover:border-slate-700'
                          }`}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Play Button */}
              <button
                onClick={handleStartGame}
                className="w-full max-w-xs py-3.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-black rounded-2xl shadow-xl shadow-cyan-500/20 text-lg tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                게임 시작하기
              </button>

            </motion.div>
          )}

          {/* ==========================================
              COUNTDOWN SCREEN (3-2-1)
              ========================================== */}
          {phase === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="flex flex-col items-center justify-center text-center h-screen w-full"
            >
              <span className="text-xl font-bold text-slate-400 mb-2 uppercase tracking-widest">READY?</span>
              <motion.div
                key={countdown}
                initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
                className="text-[12rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-red-500 drop-shadow-2xl"
              >
                {countdown}
              </motion.div>
              <div className="text-slate-400 text-sm font-semibold max-w-xs mt-4">
                곧 미션 대결이 시작됩니다! 손가락을 스크린 위에 올리세요!
              </div>
            </motion.div>
          )}

          {/* ==========================================
              PLAYING GAMEPLAY SCREEN
              ========================================== */}
          {phase === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-screen flex flex-col justify-between"
            >
              {/* Gameplay Leaderboard Progress HUD Bar */}
              <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-30 select-none">
                <div className="flex items-center gap-1">
                  <span className="text-xl">{p1Avatar.emoji}</span>
                  <span className="text-xs font-bold text-sky-400">P1 {p1.currentMissionIndex}/{p1.missions.length}</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TIMER</span>
                  <span className="font-mono text-base font-extrabold text-amber-400">⏱️ {elapsedTime.toFixed(1)}초</span>
                </div>

                {gameMode !== 'single' ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-amber-400">
                      {gameMode === 'ai' ? 'AI' : 'P2'} {p2.currentMissionIndex}/{p2.missions.length}
                    </span>
                    <span className="text-xl">{gameMode === 'ai' ? '🤖' : p2Avatar.emoji}</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-emerald-400">싱글 스피드런!</div>
                )}
              </div>

              {/* Splitscreen Split Box Grid */}
              <div className={`flex-grow w-full h-full flex ${
                gameMode !== 'single' && orientation === 'vertical' ? 'flex-col' : 'flex-row'
              }`}>
                
                {/* --------------------- PLAYER 1 SCREEN SECTION --------------------- */}
                <div className={`relative flex flex-col h-full bg-slate-900 ${
                  gameMode !== 'single'
                    ? orientation === 'vertical'
                      ? 'w-full h-1/2 border-b-4 border-slate-950'
                      : 'w-1/2 h-full border-r-4 border-slate-950'
                    : 'w-full h-full'
                }`}>
                  {/* P1 Section Header Progress dots */}
                  <div className="bg-sky-950/40 border-b border-sky-900/30 py-1.5 px-4 flex items-center justify-between select-none">
                    <div className="flex items-center gap-2">
                      <div className="text-lg">{p1Avatar.emoji}</div>
                      <div className="text-xs font-extrabold text-sky-300">플레이어 1 ({p1Avatar.name})</div>
                    </div>
                    {/* Dots indicator */}
                    <div className="flex items-center gap-1 text-[10px]">
                      {Array.from({ length: p1.missions.length }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            p1.currentMissionIndex > idx
                              ? 'bg-sky-400 shadow-sm shadow-sky-400'
                              : p1.currentMissionIndex === idx
                              ? 'bg-sky-300 animate-pulse border border-sky-400'
                              : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Play Zone */}
                  <div className="flex-grow overflow-hidden bg-sky-950/10 p-2">
                    {p1.currentMissionIndex < p1.missions.length ? (
                      <MissionRenderer
                        mission={p1.missions[p1.currentMissionIndex]}
                        onComplete={() => handleMissionComplete(1, p1.currentMissionIndex)}
                        onFail={() => handleMissionFail(1, p1.currentMissionIndex)}
                        color="blue"
                        isStunned={p1Stunned}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Trophy className="w-16 h-16 text-yellow-400 mb-2 animate-bounce" />
                        <h3 className="text-2xl font-black text-white">미션 완료! 🏁</h3>
                        <p className="text-sm text-slate-400 mt-1">상대방의 결과가 끝날 때까지 대기하세요...</p>
                        <span className="font-mono text-3xl font-extrabold text-sky-400 mt-4">{p1.totalTime.toFixed(2)}초</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* --------------------- PLAYER 2 SCREEN SECTION (Human / AI) --------------------- */}
                {gameMode !== 'single' && (
                  <div className={`relative flex flex-col h-full bg-slate-900 ${
                    orientation === 'vertical' ? 'w-full h-1/2' : 'w-1/2 h-full'
                  }`}>
                    {/* P2 Section Header Progress dots */}
                    <div className="bg-amber-950/40 border-b border-amber-900/30 py-1.5 px-4 flex items-center justify-between select-none">
                      <div className="flex items-center gap-2">
                        <div className="text-lg">{gameMode === 'ai' ? '🤖' : p2Avatar.emoji}</div>
                        <div className="text-xs font-extrabold text-amber-300">
                          {gameMode === 'ai' ? `AI 봇 (${p2Avatar.name})` : `플레이어 2 (${p2Avatar.name})`}
                        </div>
                      </div>
                      {/* Dots indicator */}
                      <div className="flex items-center gap-1 text-[10px]">
                        {Array.from({ length: p2.missions.length }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full ${
                              p2.currentMissionIndex > idx
                                ? 'bg-amber-400 shadow-sm shadow-amber-400'
                                : p2.currentMissionIndex === idx
                                ? 'bg-amber-300 animate-pulse border border-amber-400'
                                : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Play Zone */}
                    <div className="flex-grow overflow-hidden bg-amber-950/10 p-2">
                      {p2.currentMissionIndex < p2.missions.length ? (
                        gameMode === 'ai' ? (
                          <div className="w-full h-full p-1">
                            <AILiveSimulator
                              missionName={p2.missions[p2.currentMissionIndex].name}
                              progressPercent={aiProgressPercent}
                              color="orange"
                              avatar={p2Avatar.emoji}
                            />
                          </div>
                        ) : (
                          <MissionRenderer
                            mission={p2.missions[p2.currentMissionIndex]}
                            onComplete={() => handleMissionComplete(2, p2.currentMissionIndex)}
                            onFail={() => handleMissionFail(2, p2.currentMissionIndex)}
                            color="orange"
                            isStunned={p2Stunned}
                          />
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <Trophy className="w-16 h-16 text-yellow-400 mb-2 animate-bounce" />
                          <h3 className="text-2xl font-black text-white">미션 완료! 🏁</h3>
                          <p className="text-sm text-slate-400 mt-1">상대방의 결과가 끝날 때까지 대기하세요...</p>
                          <span className="font-mono text-3xl font-extrabold text-amber-400 mt-4">{p2.totalTime.toFixed(2)}초</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* ==========================================
              GAME OVER SCREEN (SPEEDRUN BREAKDOWN)
              ========================================== */}
          {phase === 'gameover' && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl px-4 py-8 flex flex-col items-center justify-center gap-6 overflow-y-auto max-h-[92vh] select-none"
            >
              {/* Confetti & Winner Header */}
              <div className="text-center flex flex-col items-center gap-2">
                <span className="text-6xl animate-bounce">🏆</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
                  {getWinnerInfo().text}
                </h1>
                <p className="text-xs text-slate-400">방과후 스피드 대격돌이 완료되었습니다!</p>
              </div>

              {/* Speed Record summary card */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                <div className="bg-sky-950/40 border border-sky-900/60 p-4 rounded-2xl text-center">
                  <div className="text-3xl mb-1">{p1Avatar.emoji}</div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">PLAYER 1</span>
                  <div className="font-mono text-3xl font-black text-sky-300 mt-1">
                    {p1.totalTime > 0 ? `${p1.totalTime.toFixed(2)}초` : '기록 없음'}
                  </div>
                </div>

                {gameMode !== 'single' ? (
                  <div className="bg-amber-950/40 border border-amber-900/60 p-4 rounded-2xl text-center">
                    <div className="text-3xl mb-1">{gameMode === 'ai' ? '🤖' : p2Avatar.emoji}</div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                      {gameMode === 'ai' ? 'AI BOT' : 'PLAYER 2'}
                    </span>
                    <div className="font-mono text-3xl font-black text-amber-300 mt-1">
                      {p2.totalTime > 0 ? `${p2.totalTime.toFixed(2)}초` : '기록 없음'}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-center flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-slate-400 block uppercase">평가 등급</span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      {p1.totalTime < 20 ? '🥇 전설의 속도' : p1.totalTime < 40 ? '🥈 명예 신속달인' : '🥉 방과후 잔잔바리'}
                    </div>
                  </div>
                )}
              </div>

              {/* Comparative Stats Breakdown Table */}
              <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-hidden shadow-inner">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300 mb-3 px-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  미션별 상세 스피드런 타임 비교 ({difficulty.toUpperCase()})
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold">
                        <th className="py-2.5 px-2">미션 목록</th>
                        <th className="py-2.5 px-2 text-center">{p1Avatar.emoji} P1 시간</th>
                        {gameMode !== 'single' && <th className="py-2.5 px-2 text-center">{gameMode === 'ai' ? '🤖' : p2Avatar.emoji} P2 시간</th>}
                        {gameMode !== 'single' && <th className="py-2.5 px-2 text-center">승자</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {p1.missions.map((m, idx) => {
                        const p1Dur = p1.missionDurations[idx] || 0;
                        const p2Dur = p2.missionDurations[idx] || 0;
                        
                        let winnerIdx: 0 | 1 | 2 = 0; // 1 = p1, 2 = p2, 0 = draw/none
                        if (p1Dur > 0 && p2Dur > 0) {
                          winnerIdx = p1Dur < p2Dur ? 1 : 2;
                        }

                        return (
                          <tr key={m.id} className="border-b border-slate-800/40 hover:bg-slate-900/30 transition-all">
                            <td className="py-2.5 px-2 font-bold text-slate-200">
                              <span className="text-gray-500 mr-1.5">#{idx + 1}</span>
                              {m.koreanName}
                            </td>
                            <td className={`py-2.5 px-2 text-center font-mono ${
                              winnerIdx === 1 ? 'text-sky-300 font-extrabold' : 'text-slate-400'
                            }`}>
                              {p1Dur > 0 ? `${p1Dur.toFixed(1)}초` : '미클리어'}
                            </td>
                            {gameMode !== 'single' && (
                              <td className={`py-2.5 px-2 text-center font-mono ${
                                winnerIdx === 2 ? 'text-amber-300 font-extrabold' : 'text-slate-400'
                              }`}>
                                {p2Dur > 0 ? `${p2Dur.toFixed(1)}초` : '미클리어'}
                              </td>
                            )}
                            {gameMode !== 'single' && (
                              <td className="py-2.5 px-2 text-center">
                                {winnerIdx === 1 ? (
                                  <span className="bg-sky-500/15 text-sky-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-500/30">
                                    ⚡ P1 승
                                  </span>
                                ) : winnerIdx === 2 ? (
                                  <span className="bg-amber-500/15 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                                    ⚡ {gameMode === 'ai' ? 'AI' : 'P2'} 승
                                  </span>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Restart controls */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <button
                  onClick={() => {
                    playSound('tap');
                    setPhase('lobby');
                  }}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-extrabold rounded-2xl border border-slate-700 text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  처음으로 (설정 변경)
                </button>
                <button
                  onClick={() => {
                    playSound('tap');
                    handleStartGame();
                  }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  재대결 하기!
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Humble page footer */}
      <footer className="py-2.5 text-center text-[10px] text-slate-500 font-medium select-none border-t border-slate-800/30 bg-slate-950/20">
        <div>방과후 스피드 레이스 • LG StanbyME 2 완벽 지원 (가로/세로 분할 및 인공지능 배틀 대응)</div>
      </footer>
    </div>
  );
}
