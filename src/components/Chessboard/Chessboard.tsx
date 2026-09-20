import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Move } from 'chess.js';
import { PieceSvg } from './PieceSvg';
import { PromotionModal } from './PromotionModal';
import { Arrow } from '../../types/chess';
import { sounds } from '../../audio/soundEffects';

interface ChessboardProps {
  chess: Chess;
  isFlipped?: boolean;
  onMove: (move: { from: Square; to: Square; promotion?: PieceSymbol }) => boolean;
  lastMove?: { from: Square; to: Square } | null;
  interactive?: boolean;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  chess,
  isFlipped = false,
  onMove,
  lastMove = null,
  interactive = true,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Right-click annotations (Chess.com feature!)
  const [markedSquares, setMarkedSquares] = useState<Set<Square>>(new Set());
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [arrowStart, setArrowStart] = useState<Square | null>(null);

  // Drag & drop state
  const [draggingSquare, setDraggingSquare] = useState<Square | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = isFlipped ? [...files].reverse() : files;
  const displayRanks = isFlipped ? [...ranks].reverse() : ranks;

  // Clear annotations when position changes
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [chess.fen()]);

  // Find King square if in check
  const getCheckedKingSquare = (): Square | null => {
    if (!chess.inCheck()) return null;
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          return (String.fromCharCode(97 + c) + (8 - r)) as Square;
        }
      }
    }
    return null;
  };

  const checkedKingSquare = getCheckedKingSquare();

  // Calculate legal moves for selected square
  const handleSelectSquare = (sq: Square) => {
    if (!interactive) return;

    // Clear right-click marks on normal left click
    if (markedSquares.size > 0 || arrows.length > 0) {
      setMarkedSquares(new Set());
      setArrows([]);
    }

    const piece = chess.get(sq);

    // If already selected, try to move or deselect
    if (selectedSquare) {
      if (selectedSquare === sq) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Check if target is in legal moves
      const matchingMove = legalMoves.find((m) => m.to === sq);
      if (matchingMove) {
        handleExecuteMove(selectedSquare, sq);
        return;
      }

      // If clicked on another own piece, switch selection
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(sq);
        const moves = chess.moves({ square: sq, verbose: true });
        setLegalMoves(moves);
        return;
      }

      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Only allow selecting pieces of the current side to move
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(sq);
      const moves = chess.moves({ square: sq, verbose: true });
      setLegalMoves(moves);
    }
  };

  // Move execution
  const handleExecuteMove = (from: Square, to: Square, promotionPiece?: PieceSymbol) => {
    const piece = chess.get(from);
    if (!piece) return;

    // Check for pawn promotion (reaching rank 8 or rank 1)
    const isPawn = piece.type === 'p';
    const isPromotionRank = (piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1');

    if (isPawn && isPromotionRank && !promotionPiece) {
      setPendingPromotion({ from, to });
      return;
    }

    const success = onMove({
      from,
      to,
      promotion: promotionPiece || 'q',
    });

    if (!success) {
      sounds.playIllegal();
    }

    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
  };

  // Drag and Drop handlers
  const handleMouseDown = (e: React.MouseEvent, sq: Square) => {
    if (!interactive) return;
    if (e.button === 2) {
      // Right click: start arrow or mark square
      setArrowStart(sq);
      return;
    }

    const piece = chess.get(sq);
    if (piece && piece.color === chess.turn()) {
      setDraggingSquare(sq);
      setSelectedSquare(sq);
      const moves = chess.moves({ square: sq, verbose: true });
      setLegalMoves(moves);
      setDragPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingSquare) {
      setDragPos({ x: e.clientX, y: e.clientY });
    }
  }, [draggingSquare]);

  const getSquareFromCoords = (clientX: number, clientY: number): Square | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }

    const squareSize = rect.width / 8;
    const col = Math.floor((clientX - rect.left) / squareSize);
    const row = Math.floor((clientY - rect.top) / squareSize);

    const file = displayFiles[col];
    const rank = displayRanks[row];
    return `${file}${rank}` as Square;
  };

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (e.button === 2) {
      // Right click released: create arrow or toggle marked square
      const targetSq = getSquareFromCoords(e.clientX, e.clientY);
      if (targetSq && arrowStart) {
        if (targetSq === arrowStart) {
          // Toggle square highlight
          setMarkedSquares((prev) => {
            const next = new Set(prev);
            if (next.has(targetSq)) next.delete(targetSq);
            else next.add(targetSq);
            return next;
          });
        } else {
          // Toggle arrow
          setArrows((prev) => {
            const exists = prev.find((a) => a.from === arrowStart && a.to === targetSq);
            if (exists) {
              return prev.filter((a) => !(a.from === arrowStart && a.to === targetSq));
            } else {
              return [...prev, { from: arrowStart, to: targetSq }];
            }
          });
        }
      }
      setArrowStart(null);
      return;
    }

    if (draggingSquare) {
      const targetSq = getSquareFromCoords(e.clientX, e.clientY);
      if (targetSq && targetSq !== draggingSquare) {
        const isLegal = legalMoves.some((m) => m.to === targetSq);
        if (isLegal) {
          handleExecuteMove(draggingSquare, targetSq);
        }
      }
      setDraggingSquare(null);
      setDragPos(null);
    }
  }, [draggingSquare, arrowStart, legalMoves]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Convert square to pixel center relative to board
  const getSquareCenter = (sq: Square) => {
    const file = sq[0];
    const rank = sq[1];
    const col = displayFiles.indexOf(file);
    const row = displayRanks.indexOf(rank);
    return {
      x: (col + 0.5) * 12.5,
      y: (row + 0.5) * 12.5,
    };
  };

  return (
    <div className="relative select-none touch-none aspect-square w-full max-w-[620px] rounded-sm overflow-hidden shadow-2xl border-4 border-[#2b2926]">
      {/* Promotion Dialog */}
      <PromotionModal
        isOpen={!!pendingPromotion}
        color={chess.turn()}
        onSelectPiece={(piece) => {
          if (pendingPromotion) {
            handleExecuteMove(pendingPromotion.from, pendingPromotion.to, piece);
          }
        }}
        onClose={() => {
          setPendingPromotion(null);
          setSelectedSquare(null);
          setLegalMoves([]);
        }}
      />

      {/* 8x8 Chess Grid */}
      <div
        ref={boardRef}
        className="w-full h-full grid grid-cols-8 grid-rows-8 relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        {displayRanks.map((rank, rowIdx) =>
          displayFiles.map((file, colIdx) => {
            const sq = `${file}${rank}` as Square;
            const isDark = (colIdx + rowIdx) % 2 === 1;
            const piece = chess.get(sq);

            const isSelected = selectedSquare === sq;
            const isLastMove = lastMove && (lastMove.from === sq || lastMove.to === sq);
            const isCheckedKing = checkedKingSquare === sq;
            const isMarked = markedSquares.has(sq);

            // Legal move hints
            const legalMove = legalMoves.find((m) => m.to === sq);
            const isLegalTarget = !!legalMove;
            const isCaptureTarget = isLegalTarget && (!!piece || legalMove.flags.includes('e'));

            // Coordinates labels (Chess.com style: inside edge squares)
            const showFileCoord = rowIdx === 7;
            const showRankCoord = colIdx === 0;

            return (
              <div
                key={sq}
                data-square={sq}
                onClick={() => handleSelectSquare(sq)}
                onMouseDown={(e) => handleMouseDown(e, sq)}
                className={`relative w-full h-full flex items-center justify-center cursor-pointer transition-colors ${
                  isDark ? 'bg-[#779556]' : 'bg-[#ebecd0]'
                } ${isCheckedKing ? 'king-in-check' : ''}`}
                style={{
                  backgroundColor: isSelected
                    ? isDark
                      ? '#baca44'
                      : '#f7f769'
                    : isLastMove
                    ? isDark
                      ? '#baca44'
                      : '#f7f769'
                    : undefined,
                }}
              >
                {/* Right-click custom mark highlight */}
                {isMarked && (
                  <div className="absolute inset-0 bg-red-500/40 pointer-events-none" />
                )}

                {/* Coordinate Rank (1-8) */}
                {showRankCoord && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold leading-none pointer-events-none select-none ${
                      isDark ? 'text-[#ebecd0]' : 'text-[#779556]'
                    }`}
                  >
                    {rank}
                  </span>
                )}

                {/* Coordinate File (a-h) */}
                {showFileCoord && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold leading-none pointer-events-none select-none ${
                      isDark ? 'text-[#ebecd0]' : 'text-[#779556]'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Chess Piece */}
                {piece && draggingSquare !== sq && (
                  <div className="w-[88%] h-[88%] pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] transition-transform duration-75">
                    <PieceSvg piece={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Legal Move Indicator: Dot for empty, Ring for capture */}
                {isLegalTarget && !isCaptureTarget && (
                  <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-black/20 pointer-events-none z-10" />
                )}

                {isCaptureTarget && (
                  <div className="absolute inset-0.5 sm:inset-1 rounded-full border-4 border-black/20 pointer-events-none z-10" />
                )}
              </div>
            );
          })
        )}

        {/* Dragging Piece Ghost */}
        {draggingSquare && dragPos && (
          <div
            className="fixed pointer-events-none z-50 piece-dragging w-16 h-16 sm:w-20 sm:h-20"
            style={{
              left: `${dragPos.x - 36}px`,
              top: `${dragPos.y - 36}px`,
            }}
          >
            {(() => {
              const piece = chess.get(draggingSquare);
              return piece ? <PieceSvg piece={piece.type} color={piece.color} /> : null;
            })()}
          </div>
        )}

        {/* Right-click Arrows (SVG Overlay) */}
        {arrows.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="6"
                refX="4"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill="rgba(245, 158, 11, 0.85)" />
              </marker>
            </defs>
            {arrows.map((arr, idx) => {
              const fromC = getSquareCenter(arr.from);
              const toC = getSquareCenter(arr.to);
              return (
                <line
                  key={idx}
                  x1={`${fromC.x}%`}
                  y1={`${fromC.y}%`}
                  x2={`${toC.x}%`}
                  y2={`${toC.y}%`}
                  stroke="rgba(245, 158, 11, 0.85)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};
