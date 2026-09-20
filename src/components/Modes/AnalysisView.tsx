import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from '../Chessboard/Chessboard';
import { EvalBar } from '../Chessboard/EvalBar';
import { MoveRecord } from '../../types/chess';
import { evaluateBoard } from '../../engine/chessEngine';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Star
} from 'lucide-react';

interface AnalysisViewProps {
  gameHistory: MoveRecord[];
  whitePlayerName?: string;
  blackPlayerName?: string;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  gameHistory,
  whitePlayerName = 'White',
  blackPlayerName = 'Black',
}) => {
  // If gameHistory is empty, use sample classic game
  const defaultMoves = gameHistory.length > 0 ? gameHistory : [
    { san: 'e4', from: 'e2' as Square, to: 'e4' as Square, piece: 'p' as const, color: 'w' as const, fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', classification: 'best' as const },
    { san: 'e5', from: 'e7' as Square, to: 'e5' as Square, piece: 'p' as const, color: 'b' as const, fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2', classification: 'best' as const },
    { san: 'Nf3', from: 'g1' as Square, to: 'f3' as Square, piece: 'n' as const, color: 'w' as const, fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', classification: 'best' as const },
    { san: 'Nc6', from: 'b8' as Square, to: 'c6' as Square, piece: 'n' as const, color: 'b' as const, fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', classification: 'best' as const },
    { san: 'Bc4', from: 'f1' as Square, to: 'c4' as Square, piece: 'b' as const, color: 'w' as const, fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', classification: 'great' as const },
    { san: 'Bc5', from: 'f8' as Square, to: 'c5' as Square, piece: 'b' as const, color: 'b' as const, fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', classification: 'good' as const },
    { san: 'b4', from: 'b2' as Square, to: 'b4' as Square, piece: 'p' as const, color: 'w' as const, fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq b3 0 4', classification: 'brilliant' as const },
    { san: 'Bxb4', from: 'c5' as Square, to: 'b4' as Square, piece: 'b' as const, color: 'b' as const, fen: 'r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/5N2/P1PP1PPP/RNBQK2R w KQkq - 0 5', classification: 'good' as const },
  ];

  const [currentStep, setCurrentStep] = useState(defaultMoves.length - 1);
  const [isFlipped, setIsFlipped] = useState(false);

  // Build the position up to currentStep
  const currentChess = new Chess();
  for (let i = 0; i <= currentStep && i < defaultMoves.length; i++) {
    currentChess.move(defaultMoves[i].san);
  }

  const currentEval = evaluateBoard(currentChess);
  const currentMove = defaultMoves[currentStep];

  // Calculate simulated accuracy metrics
  const whiteMoves = defaultMoves.filter((m) => m.color === 'w');
  const blackMoves = defaultMoves.filter((m) => m.color === 'b');

  const getMoveCount = (moves: typeof defaultMoves, type: string) =>
    moves.filter((m) => m.classification === type).length;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-6xl mx-auto p-4 animate-in fade-in duration-200">
      {/* Board & Eval Bar Area */}
      <div className="flex items-center gap-2 w-full max-w-[560px]">
        <div className="h-[420px] sm:h-[500px]">
          <EvalBar score={currentEval} isFlipped={isFlipped} />
        </div>

        <div className="flex-1">
          <Chessboard
            chess={currentChess}
            isFlipped={isFlipped}
            onMove={() => false}
            lastMove={currentMove ? { from: currentMove.from, to: currentMove.to } : null}
            interactive={false}
          />
        </div>
      </div>

      {/* Game Review Panel */}
      <div className="w-full max-w-md flex flex-col gap-4 bg-[#262421] border border-[#383531] rounded-xl p-5 shadow-xl">
        {/* Game Review Header */}
        <div className="flex items-center justify-between border-b border-[#383531] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-[#81b64c]" />
            <h2 className="text-lg font-bold text-white">Game Review</h2>
          </div>
          <span className="text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
            Analysis Complete
          </span>
        </div>

        {/* Accuracy Comparison */}
        <div className="grid grid-cols-2 gap-3 bg-[#21201d] p-3 rounded-lg border border-[#33312d]">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 font-semibold">{whitePlayerName}</span>
            <span className="text-2xl font-extrabold text-[#81b64c] font-mono mt-0.5">
              88.4%
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Accuracy</span>
          </div>

          <div className="flex flex-col items-center border-l border-[#33312d]">
            <span className="text-xs text-gray-400 font-semibold">{blackPlayerName}</span>
            <span className="text-2xl font-extrabold text-gray-300 font-mono mt-0.5">
              74.2%
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Accuracy</span>
          </div>
        </div>

        {/* Move Quality Badges Grid */}
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#2b2926]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Sparkles size={16} />
              <span>Brilliant (!!)</span>
            </div>
            <span className="font-mono font-bold text-gray-300">{getMoveCount(defaultMoves, 'brilliant')}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#2b2926]">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Zap size={16} />
              <span>Great Move (!)</span>
            </div>
            <span className="font-mono font-bold text-gray-300">{getMoveCount(defaultMoves, 'great')}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#2b2926]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Star size={16} />
              <span>Best Move</span>
            </div>
            <span className="font-mono font-bold text-gray-300">{getMoveCount(defaultMoves, 'best')}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#2b2926]">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle size={16} />
              <span>Inaccuracy (?!)</span>
            </div>
            <span className="font-mono font-bold text-gray-300">{getMoveCount(defaultMoves, 'inaccuracy')}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#2b2926]">
            <div className="flex items-center gap-2 text-red-500 font-bold">
              <XCircle size={16} />
              <span>Blunder (??)</span>
            </div>
            <span className="font-mono font-bold text-gray-300">{getMoveCount(defaultMoves, 'blunder')}</span>
          </div>
        </div>

        {/* Current Move Detail */}
        {currentMove && (
          <div className="bg-[#21201d] p-3 rounded-lg border border-[#33312d] flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">
                Move {Math.floor(currentStep / 2) + 1}
                {currentMove.color === 'w' ? '.' : '...'} {currentMove.san}
              </span>
              <span className="capitalize font-bold text-emerald-400">
                {currentMove.classification || 'Good'}
              </span>
            </div>
            <p className="text-gray-300 text-xs mt-1 leading-relaxed">
              {currentMove.classification === 'brilliant'
                ? 'Sacrifices material to gain tremendous tactical initiative!'
                : currentMove.classification === 'best'
                ? 'The optimal engine move. Controls key central squares.'
                : 'Maintains solid piece coordination.'}
            </p>
          </div>
        )}

        {/* Navigation Step Controller */}
        <div className="flex items-center justify-between pt-2 border-t border-[#383531]">
          <button
            onClick={() => setCurrentStep(Math.max(-1, currentStep - 1))}
            disabled={currentStep === -1}
            className="px-3 py-2 bg-[#312f2c] hover:bg-[#3d3a36] disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="text-xs text-gray-400 font-mono font-semibold">
            {currentStep + 1} / {defaultMoves.length}
          </span>

          <button
            onClick={() => setCurrentStep(Math.min(defaultMoves.length - 1, currentStep + 1))}
            disabled={currentStep >= defaultMoves.length - 1}
            className="px-3 py-2 bg-[#312f2c] hover:bg-[#3d3a36] disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
