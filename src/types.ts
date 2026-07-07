export interface MissionState {
  id: number;
  name: string;
  koreanName: string;
  description: string;
  status: 'idle' | 'active' | 'completed';
  data: any; // Game-specific internal state (e.g. current sum, clicked items, trash list)
}

export interface PlayerState {
  id: 1 | 2;
  name: string;
  color: string;
  score: number; // number of completed missions
  currentMissionIndex: number; // 0 to 9
  missions: MissionState[];
  totalTime: number; // in milliseconds
  completedAt: number | null; // epoch time when player completed the 10th mission
  missionDurations: number[]; // seconds taken for each of the 10 missions
}

export type ScreenOrientation = 'horizontal' | 'vertical';
export type GamePhase = 'lobby' | 'countdown' | 'playing' | 'gameover';
