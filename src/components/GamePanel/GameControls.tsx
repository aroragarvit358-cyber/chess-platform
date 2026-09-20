import React, { useState } from 'react';
import { Flag, Handshake, RotateCcw, Play, Clock } from 'lucide-react';
import { TimeControl } from '../../types/chess';

interface GameControlsProps {
  onResign: () => void;
  onOfferDraw: () => void;
  onNewGame: () => void;
  isGameOver: boolean;
  gameStatusText?: string;
  selectedTimeControl: TimeControl;
  onSelectTimeControl: (tc: TimeControl) => void;
}

export const TIME_CONTROLS: TimeControl[] = [
  { label: '1 min', seconds: 60, increment: 0 },
  { label: '3 min', seconds: 180, increment: 0 },
  { label: '5 min', seconds: 300, increment: 0 },
  { label: '10 min', seconds: 600, increment: 0 },
  { label: '30 min', seconds: 1800, increment: 0 },
];

export const GameControls: React.FC<GameControlsProps> = ({
  onResign,
  onOfferDraw,
  onNewGame,
  isGameOver,
  gameStatusText,
  selectedTimeControl,
  onSelectTimeControl,
}) => {
  const [confirmResign, setConfirmResign] = useState(false);

  return (
    <div className="flex flex-col gap-2.5 p-3 bg-[#262421] rounded-lg border border-[#383531]">
      {/* Game Status Announcement if ended */}
      {isGameOver && (
        <div className="bg-[#1f1e1b] border border-amber-500/40 p-3 rounded-md text-center">
          <div className="text-amber-400 font-extrabold text-sm uppercase tracking-wider">
            Game Over
          </div>
          <div className="text-gray-200 text-xs mt-0.5">{gameStatusText}</div>
          <button
            onClick={onNewGame}
            className="mt-2.5 w-full py-2 bg-[#81b64c] hover:bg-[#91c956] text-white font-bold text-sm rounded shadow-md transition-transform transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Rematch / New Game</span>
          </button>
        </div>
      )}

      {/* Time Control Picker (Active during pre-game or between games) */}
      {!isGameOver && (
        <div className="flex items-center justify-between gap-1 text-xs">
          <span className="text-gray-400 flex items-center gap-1 font-semibold">
            <Clock size={14} /> Time:
          </span>
          <div className="flex gap-1">
            {TIME_CONTROLS.map((tc) => (
              <button
                key={tc.label}
                onClick={() => onSelectTimeControl(tc)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedTimeControl.label === tc.label
                    ? 'bg-[#81b64c] text-white'
                    : 'bg-[#312f2c] text-gray-400 hover:text-gray-200'
                }`}
              >
                {tc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      {!isGameOver ? (
        <div className="grid grid-cols-2 gap-2 mt-1">
          {confirmResign ? (
            <div className="col-span-2 flex items-center gap-2 p-1.5 bg-red-950/60 border border-red-800 rounded">
              <span className="text-xs text-red-200 font-semibold flex-1">
                Resign game?
              </span>
              <button
                onClick={() => {
                  setConfirmResign(false);
                  onResign();
                }}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmResign(false)}
                className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirmResign(true)}
                className="py-2 px-3 bg-[#312f2c] hover:bg-red-950/40 hover:text-red-400 hover:border-red-900 border border-[#3d3a36] text-gray-300 font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Flag size={14} />
                <span>Resign</span>
              </button>

              <button
                onClick={onOfferDraw}
                className="py-2 px-3 bg-[#312f2c] hover:bg-[#3d3a36] border border-[#3d3a36] text-gray-300 font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Handshake size={14} />
                <span>Draw</span>
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};
