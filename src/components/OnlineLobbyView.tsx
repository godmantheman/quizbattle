import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Play, Copy, RefreshCw, User, Star, Monitor, 
  ArrowLeft, LogOut, Shield, Users, HelpCircle, Check, AlertCircle 
} from 'lucide-react';
import { playSound } from '../utils/sound';
import { createRoom, joinRoom, OnlineRoom, OnlinePlayer } from '../lib/onlineService';
import { Difficulty } from '../types';

const AVATARS = [
  { emoji: '🐯', name: '호랑이' },
  { emoji: '🦊', name: '여우' },
  { emoji: '🐼', name: '판다' },
  { emoji: '🐶', name: '강아지' },
  { emoji: '🐱', name: '고양이' },
  { emoji: '🐰', name: '토끼' },
];

interface OnlineLobbyViewProps {
  localPlayerId: string;
  room: OnlineRoom | null;
  onRoomUpdated: (room: OnlineRoom | null) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
}

export const OnlineLobbyView: React.FC<OnlineLobbyViewProps> = ({
  localPlayerId,
  room,
  onRoomUpdated,
  onStartGame,
  onLeaveRoom,
  difficulty,
  onDifficultyChange,
}) => {
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('speed_race_nickname') || '초고속러너';
  });
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Save nickname helper
  const handleNicknameChange = (val: string) => {
    setNickname(val);
    localStorage.setItem('speed_race_nickname', val);
  };

  // Handle Create Room
  const handleCreateRoom = async () => {
    if (!nickname.trim()) {
      setErrorMsg('닉네임을 입력해주세요!');
      return;
    }
    setErrorMsg(null);
    setIsCreating(true);
    playSound('tap');

    try {
      const code = await createRoom(
        localPlayerId,
        nickname.trim(),
        selectedAvatar.emoji,
        difficulty
      );
      // Wait for real-time listener to pick it up, or set room state locally first
      const initialRoom: OnlineRoom = {
        id: code,
        hostId: localPlayerId,
        difficulty,
        phase: 'lobby',
        createdAt: Date.now(),
        countdownStartTime: null,
        gameStartTime: null,
        missionNames: [],
        players: {
          [localPlayerId]: {
            id: localPlayerId,
            name: nickname.trim(),
            emoji: selectedAvatar.emoji,
            score: 0,
            currentMissionIndex: 0,
            progressPercent: 0,
            completedAt: null,
            totalTime: null,
            isHost: true
          }
        }
      };
      onRoomUpdated(initialRoom);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('방 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Join Room
  const handleJoinRoom = async () => {
    if (!nickname.trim()) {
      setErrorMsg('닉네임을 입력해주세요!');
      return;
    }
    if (!roomCodeInput.trim() || roomCodeInput.length !== 4) {
      setErrorMsg('올바른 4자리 방 번호를 입력해주세요!');
      return;
    }
    setErrorMsg(null);
    setIsJoining(true);
    playSound('tap');

    try {
      const joined = await joinRoom(
        roomCodeInput.trim(),
        localPlayerId,
        nickname.trim(),
        selectedAvatar.emoji
      );
      onRoomUpdated(joined);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '방 참가에 실패했습니다.');
    } finally {
      setIsJoining(false);
    }
  };

  // Copy Room Code Helper
  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    playSound('tap');
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Room Entry (Not in a room yet)
  if (!room) {
    return (
      <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 select-none relative overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-sky-500 to-amber-500" />

        <div className="text-center">
          <span className="bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block shadow mb-2">
            실시간 멀티플레이어 배틀
          </span>
          <h2 className="text-xl font-extrabold text-white">온라인 모드 대기실</h2>
          <p className="text-xs text-slate-400 mt-1">방을 만들거나 4자리 번호를 입력해 친구와 실시간 레이스를 즐기세요!</p>
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-1.5 bg-slate-950/40 border border-slate-800 p-3 rounded-2xl">
          <label className="text-xs font-black text-slate-400 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            내 닉네임 입력
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => handleNicknameChange(e.target.value.slice(0, 10))}
            placeholder="러너 이름을 입력하세요 (최대 10자)"
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:outline-none py-2 px-3.5 rounded-xl text-sm font-extrabold text-white transition-all shadow-inner"
          />
        </div>

        {/* Character/Avatar Setup */}
        <div className="flex flex-col gap-2 bg-slate-950/40 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-xs font-black text-slate-400 text-center uppercase tracking-wider block">러너 캐릭터 선택</span>
          <div className="flex justify-center gap-2 overflow-x-auto pb-1">
            {AVATARS.map((av) => (
              <button
                key={av.name}
                onClick={() => {
                  setSelectedAvatar(av);
                  playSound('tap');
                }}
                className={`text-2xl p-2.5 rounded-xl border-2 transition-all ${
                  selectedAvatar.name === av.name 
                    ? 'border-cyan-500 bg-cyan-950/30 scale-105 shadow-md shadow-cyan-500/10' 
                    : 'border-slate-800 bg-transparent opacity-60 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                {av.emoji}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-center text-slate-500 font-bold">선택된 캐릭터: {selectedAvatar.emoji} {selectedAvatar.name}</p>
        </div>

        {/* Actions section */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* Create Room Button */}
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || isJoining}
            className="py-3 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 active:scale-95 text-white font-black rounded-2xl shadow-lg shadow-cyan-500/10 text-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            방 만들기
          </button>

          {/* Join Room Box */}
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="방 코드 4자리"
              className="w-full bg-slate-950 border border-slate-850 text-center focus:border-amber-400 focus:outline-none py-2 px-2.5 rounded-xl text-sm font-mono font-black text-amber-300 shadow-inner"
            />
            <button
              onClick={handleJoinRoom}
              disabled={isCreating || isJoining}
              className="py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1 disabled:opacity-50"
            >
              참가하기
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-950/40 border border-red-900/40 px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-red-300 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    );
  }

  // Inside Room (Lobby phase)
  const isHost = room.hostId === localPlayerId;
  const playerList = Object.values(room.players) as OnlinePlayer[];

  return (
    <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 select-none relative overflow-hidden">
      {/* Top glowing line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-sky-500 to-amber-500" />

      {/* Left Column: Room info & settings */}
      <div className="flex-1 flex flex-col justify-between gap-5 border-r border-slate-800/80 pr-0 md:pr-6">
        
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              ONLINE WAITING ROOM
            </span>
            <button
              onClick={onLeaveRoom}
              className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 bg-red-950/20 px-2 py-1 rounded border border-red-900/30"
            >
              <LogOut className="w-3 h-3" />
              방 나가기
            </button>
          </div>

          {/* Room code ticket */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">방 번호 (초대 코드)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 tracking-wider">
                {room.id}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 transition-all border border-slate-800"
                title="복사하기"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[9px] text-slate-500 font-bold">친구에게 이 번호를 공유하세요!</span>
          </div>
        </div>

        {/* Room Game difficulty settings (Host only / Guest view) */}
        <div className="bg-slate-950/30 border border-slate-850/80 p-3.5 rounded-2xl flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 justify-center">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            게임 난이도 설정
          </div>

          {isHost ? (
            <div className="grid grid-cols-4 gap-1.5">
              {(['easy', 'normal', 'hard', 'nightmare'] as const).map((diff) => {
                const label = 
                  diff === 'easy' ? '쉬움' :
                  diff === 'normal' ? '보통' :
                  diff === 'hard' ? '어려움' : '지옥';
                const activeClass = 
                  diff === 'easy' ? 'border-green-500 bg-green-950/40 text-green-300 font-black' :
                  diff === 'normal' ? 'border-sky-500 bg-sky-950/40 text-sky-300 font-black' :
                  diff === 'hard' ? 'border-orange-500 bg-orange-950/40 text-orange-300 font-black' :
                  diff === 'nightmare' ? 'border-red-500 bg-red-950/40 text-red-400 font-black' : '';
                return (
                  <button
                    key={diff}
                    onClick={() => {
                      onDifficultyChange(diff);
                      playSound('tap');
                    }}
                    className={`py-2 px-0.5 rounded-xl border text-[10px] font-extrabold transition-all ${
                      room.difficulty === diff ? activeClass : 'border-slate-850 bg-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-2 bg-slate-950/50 border border-slate-900 rounded-xl">
              <span className="text-xs font-bold text-slate-400">방장이 난이도를 조율 중입니다.</span>
              <div className="text-base font-black text-amber-400 mt-1 uppercase tracking-wider">
                {room.difficulty === 'easy' ? '🟢 쉬움 (EASY)' :
                 room.difficulty === 'normal' ? '🔵 보통 (NORMAL)' :
                 room.difficulty === 'hard' ? '🟠 어려움 (HARD)' : '🔴 지옥 (NIGHTMARE)'}
              </div>
            </div>
          )}
        </div>

        {/* Start button for host, waiting for guest */}
        {isHost ? (
          <button
            onClick={onStartGame}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/10 text-base tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            게임 시작하기! (총 20개 미션)
          </button>
        ) : (
          <div className="w-full py-3 bg-slate-950/40 border border-slate-850 rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 animate-pulse">
            <span className="text-xs font-bold text-slate-400">방장이 게임을 시작하기를 기다리고 있습니다...</span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">WAITING FOR HOST TO START</span>
          </div>
        )}

      </div>

      {/* Right Column: Joined Players list */}
      <div className="w-full md:w-64 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 border-b border-slate-800/80 pb-1.5">
          <Users className="w-4 h-4 text-cyan-400" />
          참가 중인 러너들 ({playerList.length}명)
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-56 pr-1">
          {playerList.map((player) => {
            const isMe = player.id === localPlayerId;
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isMe 
                    ? 'bg-sky-950/20 border-sky-500/40' 
                    : 'bg-slate-950/40 border-slate-850/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl transform hover:scale-110 transition-transform">{player.emoji}</span>
                  <div className="flex flex-col">
                    <span className={`text-xs font-extrabold ${isMe ? 'text-sky-300' : 'text-slate-200'}`}>
                      {player.name}
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold">
                      {isMe ? '나 (Local)' : '온라인 상대'}
                    </span>
                  </div>
                </div>

                {player.isHost && (
                  <span className="flex items-center gap-0.5 bg-amber-500/10 text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-500/30">
                    👑 방장
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
