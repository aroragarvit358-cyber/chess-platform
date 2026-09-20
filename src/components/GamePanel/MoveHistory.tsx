import React, { useRef, useEffect } from 'react';
import { MoveRecord } from '../../types/chess';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw } from 'lucide-react';

interface MoveHistoryProps {
  moves: MoveRecord[];
  currentMoveIndex: number; // -1 for starting position
  onSelectMove: (index: number) => void;
  openingName?: string;
  onFlipBoard?: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onSelectMove,
  openingName,
  onFlipBoard,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group moves into pairs (White move, Black move)
  const movePairs: { num: number; white: MoveRecord; black?: MoveRecord; whiteIdx: number; blackIdx?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
      whiteIdx: i,
      blackIdx: i + 1 < moves.length ? i + 1 : undefined,
    });
  }

  // Auto scroll to latest move
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  return (
    <div className="flex flex-col h-full bg-[#262421] rounded-lg border border-[#383531] overflow-hidden shadow-md">
      {/* Opening Banner */}
      {openingName && (
        <div className="px-3 py-2 bg-[#21201d] border-b border-[#33312d] text-xs font-semibold text-emerald-400 truncate flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{openingName}</span>
        </div>
      )}

      {/* Move History Table */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-sm space-y-0.5 select-none"
      >
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-500 font-sans italic">
            Moves will appear here
          </div>
        ) : (
          movePairs.map((pair) => {
            const isWhiteSelected = currentMoveIndex === pair.whiteIdx;
            const isBlackSelected = pair.blackIdx !== undefined && currentMoveIndex === pair.blackIdx;

            return (
              <div
                key={pair.num}
                className="grid grid-cols-12 items-center py-1 px-2 rounded hover:bg-[#302e2b] transition-colors"
              >
                {/* Move number */}
                <span className="col-span-2 text-gray-500 text-xs font-semibold">
                  {pair.num}.
                </span>

                {/* White move */}
                <button
                  onClick={() => onSelectMove(pair.whiteIdx)}
                  className={`col-span-5 text-left px-2 py-0.5 rounded font-bold transition-colors ${
                    isWhiteSelected
                      ? 'bg-[#81b64c] text-white'
                      : 'text-gray-200 hover:bg-[#3d3a36]'
                  }`}
                >
                  {pair.white.san}
                </button>

                {/* Black move */}
                {pair.black && pair.blackIdx !== undefined && (
                  <button
                    onClick={() => onSelectMove(pair.blackIdx!)}
                    className={`col-span-5 text-left px-2 py-0.5 rounded font-bold transition-colors ${
                      isBlackSelected
                        ? 'bg-[#81b64c] text-white'
                        : 'text-gray-200 hover:bg-[#3d3a36]'
                    }`}
                  >
                    {pair.black.san}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Navigation Controls Bar */}
      <div className="flex items-center justify-between p-2 bg-[#21201d] border-t border-[#33312d]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectMove(-1)}
            disabled={currentMoveIndex === -1}
            className="p-1.5 rounded bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 disabled:pointer-events-none text-gray-300 transition-colors"
            title="First Move"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => onSelectMove(Math.max(-1, currentMoveIndex - 1))}
            disabled={currentMoveIndex === -1}
            className="p-1.5 rounded bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 disabled:pointer-events-none text-gray-300 transition-colors"
            title="Previous Move"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onSelectMove(Math.min(moves.length - 1, currentMoveIndex + 1))}
            disabled={currentMoveIndex >= moves.length - 1}
            className="p-1.5 rounded bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 disabled:pointer-events-none text-gray-300 transition-colors"
            title="Next Move"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => onSelectMove(moves.length - 1)}
            disabled={currentMoveIndex >= moves.length - 1}
            className="p-1.5 rounded bg-[#2b2926] hover:bg-[#383531] disabled:opacity-30 disabled:pointer-events-none text-gray-300 transition-colors"
            title="Latest Move"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        {onFlipBoard && (
          <button
            onClick={onFlipBoard}
            className="p-1.5 rounded bg-[#2b2926] hover:bg-[#383531] text-gray-300 transition-colors flex items-center gap-1 text-xs font-semibold px-2"
            title="Flip Board"
          >
            <RotateCcw size={14} />
            <span>Flip</span>
          </button>
        )}
      </div>
    </div>
  );
};
