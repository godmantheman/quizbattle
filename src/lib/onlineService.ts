import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Difficulty } from '../types';

export interface OnlinePlayer {
  id: string;
  name: string;
  emoji: string;
  score: number;
  currentMissionIndex: number;
  progressPercent: number;
  completedAt: number | null;
  totalTime: number | null;
  isHost: boolean;
}

export interface OnlineRoom {
  id: string;
  hostId: string;
  difficulty: Difficulty;
  phase: 'lobby' | 'countdown' | 'playing' | 'gameover';
  createdAt: number;
  countdownStartTime: number | null;
  gameStartTime: number | null;
  missionNames: string[];
  players: { [playerId: string]: OnlinePlayer };
}

// Generate a random 4-digit numeric room code
function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate exactly 20 mission names for the speed race
function generate20Missions(): string[] {
  const missionPool = [
    'palm_scan', 'gugudan', 'erase_chalk', 'bell_chime', 
    'trash_sort', 'locker_cipher', 'pencil_sharpen', 
    'catch_flies', 'lunch_tray', 'ascending_numbers',
    'card_matching', 'pop_balloons'
  ];
  const slicedNames: string[] = [];
  for (let i = 0; i < 20; i++) {
    slicedNames.push(missionPool[Math.floor(Math.random() * missionPool.length)]);
  }
  return slicedNames;
}

// Create a new room
export async function createRoom(
  playerId: string, 
  playerName: string, 
  playerEmoji: string, 
  difficulty: Difficulty
): Promise<string> {
  const code = generateRoomCode();
  const roomRef = doc(db, 'rooms', code);

  const initialPlayer: OnlinePlayer = {
    id: playerId,
    name: playerName,
    emoji: playerEmoji,
    score: 0,
    currentMissionIndex: 0,
    progressPercent: 0,
    completedAt: null,
    totalTime: null,
    isHost: true
  };

  const roomData: OnlineRoom = {
    id: code,
    hostId: playerId,
    difficulty,
    phase: 'lobby',
    createdAt: Date.now(),
    countdownStartTime: null,
    gameStartTime: null,
    missionNames: generate20Missions(),
    players: {
      [playerId]: initialPlayer
    }
  };

  await setDoc(roomRef, roomData);
  return code;
}

// Join an existing room
export async function joinRoom(
  roomCode: string, 
  playerId: string, 
  playerName: string, 
  playerEmoji: string
): Promise<OnlineRoom> {
  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('존재하지 않는 방 번호입니다.');
  }

  const roomData = roomSnap.data() as OnlineRoom;
  
  if (roomData.phase !== 'lobby') {
    throw new Error('이미 게임이 시작되었거나 종료된 방입니다.');
  }

  // Add or update player in the players map
  const updatedPlayers = { ...roomData.players };
  updatedPlayers[playerId] = {
    id: playerId,
    name: playerName,
    emoji: playerEmoji,
    score: 0,
    currentMissionIndex: 0,
    progressPercent: 0,
    completedAt: null,
    totalTime: null,
    isHost: roomData.hostId === playerId
  };

  await updateDoc(roomRef, {
    players: updatedPlayers
  });

  return {
    ...roomData,
    players: updatedPlayers
  };
}

// Update difficulty of the room (Host only)
export async function updateRoomDifficulty(roomCode: string, difficulty: Difficulty) {
  const roomRef = doc(db, 'rooms', roomCode);
  await updateDoc(roomRef, { difficulty });
}

// Start the game (Host only) - sets phase to countdown and starts countdown timer
export async function startOnlineGame(roomCode: string) {
  const roomRef = doc(db, 'rooms', roomCode);
  
  // Regenerate fresh missions on start so each play session is different!
  await updateDoc(roomRef, {
    phase: 'countdown',
    countdownStartTime: Date.now(),
    missionNames: generate20Missions(),
    // Reset all player game stats
    gameStartTime: null
  });
}

// Transition from countdown to playing phase
export async function setRoomPlaying(roomCode: string, gameStartTime: number) {
  const roomRef = doc(db, 'rooms', roomCode);
  await updateDoc(roomRef, {
    phase: 'playing',
    gameStartTime
  });
}

// Update single player game progress in real-time
export async function updatePlayerProgress(
  roomCode: string,
  playerId: string,
  currentMissionIndex: number,
  score: number,
  progressPercent: number,
  completedAt: number | null = null,
  totalTime: number | null = null
) {
  const roomRef = doc(db, 'rooms', roomCode);
  
  // Use firestore dot notation for deep nested update
  const updates: any = {};
  updates[`players.${playerId}.currentMissionIndex`] = currentMissionIndex;
  updates[`players.${playerId}.score`] = score;
  updates[`players.${playerId}.progressPercent`] = progressPercent;
  
  if (completedAt !== null) {
    updates[`players.${playerId}.completedAt`] = completedAt;
  }
  if (totalTime !== null) {
    updates[`players.${playerId}.totalTime`] = totalTime;
  }

  await updateDoc(roomRef, updates);
}

// Return to lobby (Host only)
export async function returnToRoomLobby(roomCode: string) {
  const roomRef = doc(db, 'rooms', roomCode);
  
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  const roomData = roomSnap.data() as OnlineRoom;

  // Reset all players stats for the new lobby
  const resetPlayers = { ...roomData.players };
  Object.keys(resetPlayers).forEach(pId => {
    resetPlayers[pId] = {
      ...resetPlayers[pId],
      score: 0,
      currentMissionIndex: 0,
      progressPercent: 0,
      completedAt: null,
      totalTime: null
    };
  });

  await updateDoc(roomRef, {
    phase: 'lobby',
    countdownStartTime: null,
    gameStartTime: null,
    players: resetPlayers
  });
}

// Exit the room
export async function leaveRoom(roomCode: string, playerId: string) {
  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) return;
  const roomData = roomSnap.data() as OnlineRoom;

  const updatedPlayers = { ...roomData.players };
  delete updatedPlayers[playerId];

  // If no players left, delete room
  if (Object.keys(updatedPlayers).length === 0) {
    await deleteDoc(roomRef);
    return;
  }

  const updates: any = { players: updatedPlayers };

  // If host left, assign new host
  if (roomData.hostId === playerId) {
    const nextPlayerId = Object.keys(updatedPlayers)[0];
    updates.hostId = nextPlayerId;
    updatedPlayers[nextPlayerId].isHost = true;
  }

  await updateDoc(roomRef, updates);
}

// Subscribe to room real-time updates
export function subscribeToRoom(roomCode: string, callback: (room: OnlineRoom | null) => void) {
  const roomRef = doc(db, 'rooms', roomCode);
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as OnlineRoom);
    } else {
      callback(null);
    }
  });
}
