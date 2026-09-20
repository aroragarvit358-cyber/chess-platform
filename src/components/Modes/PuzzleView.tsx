import React, { useState, useEffect } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { Chessboard } from '../Chessboard/Chessboard';
import { TACTICAL_PUZZLES } from '../../engine/puzzles';
import { TacticalPuzzle } from '../../types/chess';
import { sounds } from '../../audio/soundEffects';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Flame, Trophy } from 'lucide-react';

export const PuzzleView: React.FC = () => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [chess, setChess] = useState<Chess>(new Chess());
  const [solutionStep, setSolutionStep] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [userRating, setUserRating] = useState(1200);
  const [streak, setStreak] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const currentPuzzle: TacticalPuzzle = TACTICAL_PUZZLES[puzzleIndex % TACTICAL_PUZZLES.length];

  // Load current puzzle position
  const loadPuzzle = (idx: number) => {
    const p = TACTICAL_PUZZLES[idx % TACTICAL_PUZZLES.length];
    const newChess = new Chess(p.fen);
    setChess(newChess);
    setSolutionStep(0);
    setStatus('playing');
    setLastMove(null);
  };

  useEffect(() => {
    loadPuzzle(puzzleIndex);
  }, [puzzleIndex]);

  const handlePlayerMove = (moveObj: { from: Square; to: Square; promotion?: PieceSymbol }): boolean => {
    if (status !== 'playing') return false;

    // Check if player move matches solution
    const tempChess = new Chess(chess.fen());
    try {
      const executed = tempChess.move(moveObj);
      if (!executed) return false;

      const expectedSan = currentPuzzle.solutionMoves[solutionStep];
      if (executed.san === expectedSan) {
        // Correct move!
        sounds.playMove();
        setChess(tempChess);
        setLastMove({ from: moveObj.from, to: moveObj.to });

        const nextStep = solutionStep + 1;
        setSolutionStep(nextStep);

        if (nextStep >= currentPuzzle.solutionMoves.length) {
          // Solved completely!
          setStatus('correct');
          sounds.playPuzzleSuccess();
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          setUserRating((prev) => prev + 15);
          setStreak((prev) => prev + 1);
        } else {
          // Opponent auto-reply move
          setTimeout(() => {
            const oppSan = currentPuzzle.solutionMoves[nextStep];
            if (oppSan) {
              const oppMove = tempChess.move(oppSan);
              if (oppMove) {
                sounds.playMove();
                setChess(new Chess(tempChess.fen()));
                setLastMove({ from: oppMove.from, to: oppMove.to });
                setSolutionStep(nextStep + 1);
              }
            }
          }, 450);
        }
        return true;
      } else {
        // Wrong move
        setStatus('wrong');
        sounds.playPuzzleFail();
        setStreak(0);
        setUserRating((prev) => Math.max(400, prev - 10));
        return false;
      }
    } catch {
      return false;
    }
  };

  const handleNextPuzzle = () => {
    setPuzzleIndex((prev) => prev + 1);
  };

  const handleRetry = () => {
    loadPuzzle(puzzleIndex);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-5xl mx-auto p-4 animate-in fade-in duration-200">
      {/* Chessboard */}
      <div className="w-full max-w-[520px] flex flex-col items-center">
        <Chessboard
          chess={chess}
          isFlipped={currentPuzzle.playerColor === 'b'}
          onMove={handlePlayerMove}
          lastMove={lastMove}
          interactive={status === 'playing'}
        />
      </div>

      {/* Right Puzzle Panel */}
      <div className="w-full max-w-sm flex flex-col gap-4 bg-[#262421] border border-[#383531] rounded-xl p-5 shadow-xl">
        {/* Rating and Streak Banner */}
        <div className="flex items-center justify-between border-b border-[#383531] pb-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-semibold">Puzzle Rating</span>
              <span className="text-xl font-bold font-mono text-white">{userRating}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#21201d] px-3 py-1.5 rounded-lg border border-[#383531]">
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Streak</span>
              <span className="text-base font-extrabold text-orange-400 font-mono">{streak}</span>
            </div>
          </div>
        </div>

        {/* Puzzle Metadata */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{currentPuzzle.title}</h3>
            <span className="text-xs bg-[#312f2c] text-gray-300 font-bold px-2 py-0.5 rounded">
              Rating: {currentPuzzle.rating}
            </span>
          </div>
          <p className="text-xs text-[#81b64c] font-semibold mt-1">
            {currentPuzzle.theme}
          </p>
          <p className="text-xs text-gray-300 mt-2 bg-[#21201d] p-3 rounded-lg border border-[#33312d]">
            {currentPuzzle.description}
          </p>
        </div>

        {/* Status Feedback */}
        {status === 'correct' && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-600/70 text-emerald-300 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
            <div className="flex-1 text-xs">
              <span className="font-bold text-sm block">Puzzle Solved!</span>
              +15 Rating points earned!
            </div>
          </div>
        )}

        {status === 'wrong' && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-950/60 border border-red-600/70 text-red-300 animate-in fade-in slide-in-from-top-1">
            <XCircle size={20} className="text-red-400 flex-shrink-0" />
            <div className="flex-1 text-xs">
              <span className="font-bold text-sm block">Incorrect Move</span>
              That wasn't the best tactical continuation.
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 pt-2">
          {status === 'correct' ? (
            <button
              onClick={handleNextPuzzle}
              className="flex-1 py-3 bg-[#81b64c] hover:bg-[#91c956] text-white font-bold text-sm rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform transform active:scale-95 cursor-pointer"
            >
              <span>Next Puzzle</span>
              <ArrowRight size={16} />
            </button>
          ) : status === 'wrong' ? (
            <>
              <button
                onClick={handleRetry}
                className="flex-1 py-2.5 bg-[#383531] hover:bg-[#484541] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} />
                <span>Try Again</span>
              </button>
              <button
                onClick={handleNextPuzzle}
                className="flex-1 py-2.5 bg-[#21201d] hover:bg-[#2b2926] text-gray-300 font-semibold text-xs rounded-lg border border-[#383531] flex items-center justify-center gap-1.5"
              >
                <span>Skip</span>
                <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <div className="text-center w-full text-xs text-gray-400 italic py-2">
              Find the best move for {currentPuzzle.playerColor === 'w' ? 'White' : 'Black'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
