import React from 'react';

interface EvalBarProps {
  score: number; // centipawns (+ for white, - for black)
  isFlipped?: boolean;
}

export const EvalBar: React.FC<EvalBarProps> = ({ score, isFlipped = false }) => {
  // Clamp evaluation between -15 and +15 pawns for visual percentage
  // Sigmoid / scaled function to match Chess.com style
  const pawns = score / 100;
  
  // Percentage of white height (0% = completely black advantage, 100% = completely white advantage)
  // At 0 pawns, it is exactly 50%
  let whitePercent = 50 + (2 / (1 + Math.exp(-0.35 * pawns)) - 1) * 50;
  whitePercent = Math.max(5, Math.min(95, whitePercent));

  // If board is flipped, invert
  const displayWhitePercent = isFlipped ? 100 - whitePercent : whitePercent;

  // Format label: e.g. +1.4 or -2.5
  let label = '';
  if (Math.abs(score) >= 90000) {
    label = score > 0 ? 'M' : '-M';
  } else {
    label = (pawns > 0 ? '+' : '') + pawns.toFixed(1);
  }

  const isWhiteWinning = isFlipped ? displayWhitePercent < 50 : displayWhitePercent > 50;

  return (
    <div className="relative w-6 sm:w-7 h-full rounded-md overflow-hidden bg-[#262421] border border-[#3d3b38] flex flex-col justify-between shadow-inner select-none font-bold text-[10px] sm:text-xs">
      {/* Black's section (Top if White perspective) */}
      <div 
        className="w-full bg-[#1b1a18] text-[#888886] flex items-start justify-center pt-1 transition-all duration-300 ease-out"
        style={{ height: `${100 - displayWhitePercent}%` }}
      >
        {!isWhiteWinning && (
          <span className="font-mono text-zinc-300 drop-shadow-sm">{label}</span>
        )}
      </div>

      {/* White's section (Bottom if White perspective) */}
      <div 
        className="w-full bg-[#ffffff] text-[#333333] flex items-end justify-center pb-1 transition-all duration-300 ease-out"
        style={{ height: `${displayWhitePercent}%` }}
      >
        {isWhiteWinning && (
          <span className="font-mono text-zinc-900 drop-shadow-sm">{label}</span>
        )}
      </div>
    </div>
  );
};
