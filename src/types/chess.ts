import { Square, PieceSymbol, Color } from 'chess.js';

export type GameMode = 'bot' | 'local' | 'puzzle' | 'analysis';

export interface PlayerInfo {
  name: string;
  rating: number;
  avatar: string;
  country: string;
  title?: string;
  isBot?: boolean;
}

export interface BotProfile {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  description: string;
  quote: string;
  depth: number;
  randomness: number; // 0 to 1 (likelihood to play suboptimal move)
  aggression: number; // preference for captures/attacks
  avatarBg: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  banter: {
    start: string[];
    moveGood: string[];
    moveBad: string[];
    capture: string[];
    check: string[];
    win: string[];
    loss: string[];
  };
}

export interface MoveRecord {
  san: string;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  color: Color;
  captured?: PieceSymbol;
  fen: string;
  eval?: number;
  classification?: 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  commentary?: string;
}

export interface TacticalPuzzle {
  id: string;
  title: string;
  theme: string;
  rating: number;
  fen: string;
  playerColor: 'w' | 'b';
  solutionMoves: string[]; // SAN list e.g. ["Qxf7+", "Kh8", "Qf8#"]
  description: string;
}

export interface Arrow {
  from: Square;
  to: Square;
  color?: string;
}

export interface TimeControl {
  label: string;
  seconds: number;
  increment: number;
}
