import React from 'react';
import { PieceSymbol, Color } from 'chess.js';
import { PieceSvg } from './PieceSvg';

interface PromotionModalProps {
  color: Color;
  isOpen: boolean;
  onSelectPiece: (piece: PieceSymbol) => void;
  onClose: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  color,
  isOpen,
  onSelectPiece,
  onClose
}) => {
  if (!isOpen) return null;

  const pieces: PieceSymbol[] = ['q', 'n', 'r', 'b'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#262421] border border-[#403d39] rounded-xl p-4 shadow-2xl flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-bold tracking-wider text-gray-300 uppercase">
          Promote Pawn
        </div>
        <div className="flex gap-2">
          {pieces.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelectPiece(piece)}
              className="w-16 h-16 sm:w-20 sm:h-20 p-2 bg-[#302e2b] hover:bg-[#81b64c]/20 hover:border-[#81b64c] border border-[#3d3b38] rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer group shadow-md"
              title={`Promote to ${piece === 'q' ? 'Queen' : piece === 'n' ? 'Knight' : piece === 'r' ? 'Rook' : 'Bishop'}`}
            >
              <div className="w-full h-full group-hover:drop-shadow-[0_0_8px_rgba(129,182,76,0.6)]">
                <PieceSvg piece={piece} color={color} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
