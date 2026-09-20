import React from 'react';
import { PlayerInfo } from '../types/chess';
import { PieceSymbol } from 'chess.js';
import { PieceSvg } from './Chessboard/PieceSvg';

interface PlayerCardProps {
  player: PlayerInfo;
  timeRemaining?: number; // seconds
  isActiveTurn?: boolean;
  capturedPieces?: PieceSymbol[];
  materialAdvantage?: number; // >0 means this player is ahead
  color: 'w' | 'b';
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  timeRemaining = 600,
  isActiveTurn = false,
  capturedPieces = [],
  materialAdvantage = 0,
  color,
}) => {
  // Format seconds into MM:SS (or S.t when low)
  const formatTime = (secs: number) => {
    if (secs < 0) secs = 0;
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    if (mins === 0 && s < 10) {
      // Millisecond-style precision when under 10 seconds
      return `${s}.${Math.floor((secs % 1) * 10)}`;
    }
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLowTime = timeRemaining <= 20;

  // Group captured pieces: Pawns, Knights, Bishops, Rooks, Queens
  const pieceOrder: PieceSymbol[] = ['p', 'n', 'b', 'r', 'q'];
  const sortedCaptures = [...capturedPieces].sort(
    (a, b) => pieceOrder.indexOf(a) - pieceOrder.indexOf(b)
  );

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
        isActiveTurn
          ? 'bg-[#272522] border-l-4 border-[#81b64c] shadow-md'
          : 'bg-[#21201d] border-l-4 border-transparent'
      }`}
    >
      {/* Player identity info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-md overflow-hidden bg-[#383531] border border-[#484541] flex items-center justify-center text-xl sm:text-2xl shadow">
          {player.avatar}
          {player.title && (
            <span className="absolute bottom-0 right-0 bg-red-600 text-white font-extrabold text-[9px] px-1 rounded-tl">
              {player.title}
            </span>
          )}
        </div>

        {/* Name and captured pieces */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm sm:text-base leading-tight">
              {player.name}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              ({player.rating})
            </span>
            <span className="text-xs">{player.country}</span>
          </div>

          {/* Captured Pieces by this player */}
          <div className="flex items-center gap-1 mt-0.5 min-h-[16px]">
            <div className="flex items-center -space-x-1">
              {sortedCaptures.map((p, idx) => (
                <div key={idx} className="w-4 h-4 opacity-75">
                  <PieceSvg piece={p} color={color === 'w' ? 'b' : 'w'} />
                </div>
              ))}
            </div>
            {materialAdvantage > 0 && (
              <span className="text-[11px] font-bold text-gray-300 ml-1">
                +{materialAdvantage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Digital Clock */}
      <div
        className={`flex items-center justify-center px-3 py-1.5 rounded font-mono font-bold text-base sm:text-lg min-w-[75px] shadow-inner transition-colors ${
          isActiveTurn
            ? isLowTime
              ? 'bg-red-950/80 text-red-400 border border-red-500 animate-pulse'
              : 'bg-[#f1f1f1] text-[#222222]'
            : 'bg-[#181715] text-[#888886] border border-[#2e2c29]'
        }`}
      >
        <span>{formatTime(timeRemaining)}</span>
      </div>
    </div>
  );
};
