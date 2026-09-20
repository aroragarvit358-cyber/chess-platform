import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import { Sidebar } from './components/Sidebar';
import { Chessboard } from './components/Chessboard/Chessboard';
import { EvalBar } from './components/Chessboard/EvalBar';
import { PlayerCard } from './components/PlayerCard';
import { MoveHistory } from './components/GamePanel/MoveHistory';
import { GameControls, TIME_CONTROLS } from './components/GamePanel/GameControls';
import { BotDialog } from './components/GamePanel/BotDialog';
import { BotSelectionModal } from './components/Modes/BotSelectionModal';
import { PuzzleView } from './components/Modes/PuzzleView';
import { AnalysisView } from './components/Modes/AnalysisView';
import { 
  GameMode, 
  PlayerInfo, 
  BotProfile, 
  MoveRecord, 
  TimeControl 
} from './types/chess';
import { BOT_PROFILES, getBotMove, evaluateBoard } from './engine/chessEngine';
import { detectOpening } from './engine/openings';
import { sounds } from './audio/soundEffects';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<GameMode>('bot');
  const [chess, setChess] = useState<Chess>(new Chess());
  const [isFlipped, setIsFlipped] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Time controls & Clocks
  const [timeControl, setTimeControl] = useState<TimeControl>(TIME_CONTROLS[3]); // 10 min
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);

  // Game tracking
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameStatusText, setGameStatusText] = useState<string>('');
  const [openingName, setOpeningName] = useState<string>('');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Captured pieces
  const [whiteCaptures, setWhiteCaptures] = useState<PieceSymbol[]>([]);
  const [blackCaptures, setBlackCaptures] = useState<PieceSymbol[]>([]);

  // Bot state
  const [selectedBot, setSelectedBot] = useState<BotProfile>(BOT_PROFILES[0]); // Martin
  const [botModalOpen, setBotModalOpen] = useState(false);
  const [botMessage, setBotMessage] = useState<string>(selectedBot.banter.start[0]);

  // Sound sync
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setSoundEnabled(next);
  };

  // Clock countdown interval
  useEffect(() => {
    if (isGameOver || activeMode === 'puzzle' || activeMode === 'analysis') return;

    const timer = setInterval(() => {
      const turn = chess.turn();
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            handleTimeout('w');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            handleTimeout('b');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [chess.turn(), isGameOver, activeMode]);

  // Handle timeout
  const handleTimeout = (color: 'w' | 'b') => {
    setIsGameOver(true);
    sounds.playGameEnd(false);
    const loser = color === 'w' ? 'White' : 'Black';
    const winner = color === 'w' ? 'Black' : 'White';
    setGameStatusText(`${winner} wins on time! (${loser} ran out of time)`);
  };

  // Check game over states
  const checkGameEndConditions = useCallback((c: Chess) => {
    if (c.isCheckmate()) {
      setIsGameOver(true);
      const winner = c.turn() === 'w' ? 'Black' : 'White';
      const isPlayerWin = winner === 'White';
      sounds.playGameEnd(isPlayerWin);
      if (isPlayerWin) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
      setGameStatusText(`Checkmate! ${winner} wins.`);
      if (activeMode === 'bot') {
        const quotes = isPlayerWin ? selectedBot.banter.loss : selectedBot.banter.win;
        setBotMessage(quotes[Math.floor(Math.random() * quotes.length)]);
      }
      return true;
    }
    if (c.isStalemate()) {
      setIsGameOver(true);
      sounds.playGameEnd(false);
      setGameStatusText('Draw by Stalemate.');
      return true;
    }
    if (c.isThreefoldRepetition()) {
      setIsGameOver(true);
      sounds.playGameEnd(false);
      setGameStatusText('Draw by Threefold Repetition.');
      return true;
    }
    if (c.isInsufficientMaterial()) {
      setIsGameOver(true);
      sounds.playGameEnd(false);
      setGameStatusText('Draw by Insufficient Material.');
      return true;
    }
    if (c.isDraw()) {
      setIsGameOver(true);
      sounds.playGameEnd(false);
      setGameStatusText('Game drawn.');
      return true;
    }
    return false;
  }, [activeMode, selectedBot]);

  // Bot move logic
  const triggerBotMove = useCallback((currentChess: Chess) => {
    if (isGameOver || currentChess.turn() !== 'b') return;

    // Small delay to simulate bot thinking
    setTimeout(() => {
      const move = getBotMove(currentChess, selectedBot);
      if (!move) return;

      try {
        const result = currentChess.move(move);
        if (!result) return;

        // Play appropriate sound
        if (result.captured) {
          sounds.playCapture();
          setBlackCaptures((prev) => [...prev, result.captured as PieceSymbol]);
          const captureQuotes = selectedBot.banter.capture;
          setBotMessage(captureQuotes[Math.floor(Math.random() * captureQuotes.length)]);
        } else if (result.san.includes('O-O')) {
          sounds.playCastle();
        } else {
          sounds.playMove();
        }

        if (currentChess.inCheck()) {
          sounds.playCheck();
          const checkQuotes = selectedBot.banter.check;
          setBotMessage(checkQuotes[Math.floor(Math.random() * checkQuotes.length)]);
        }

        const newRecord: MoveRecord = {
          san: result.san,
          from: result.from,
          to: result.to,
          piece: result.piece,
          color: 'b',
          captured: result.captured,
          fen: currentChess.fen(),
          classification: 'best',
        };

        const updatedHistory = [...moveHistory, newRecord];
        setMoveHistory(updatedHistory);
        setCurrentMoveIndex(updatedHistory.length - 1);
        setLastMove({ from: result.from, to: result.to });
        setChess(new Chess(currentChess.fen()));

        // Update opening
        const sans = updatedHistory.map((m) => m.san);
        const op = detectOpening(sans);
        if (op) setOpeningName(op.name);

        checkGameEndConditions(currentChess);
      } catch (err) {
        console.error("Bot move error:", err);
      }
    }, 450);
  }, [isGameOver, moveHistory, selectedBot, checkGameEndConditions]);

  // Move handler
  const handleMove = (moveObj: { from: Square; to: Square; promotion?: PieceSymbol }): boolean => {
    if (isGameOver) return false;

    // If we're currently viewing an earlier move, prevent making moves or jump to latest
    if (currentMoveIndex !== moveHistory.length - 1 && moveHistory.length > 0) {
      return false;
    }

    const currentTurn = chess.turn();

    // Prevent moving opponent's pieces in bot mode
    if (activeMode === 'bot' && currentTurn !== 'w') {
      return false;
    }

    try {
      const result = chess.move(moveObj);
      if (!result) return false;

      // Play sound
      if (result.captured) {
        sounds.playCapture();
        if (currentTurn === 'w') {
          setWhiteCaptures((prev) => [...prev, result.captured as PieceSymbol]);
        } else {
          setBlackCaptures((prev) => [...prev, result.captured as PieceSymbol]);
        }
      } else if (result.san.includes('O-O')) {
        sounds.playCastle();
      } else {
        sounds.playMove();
      }

      if (chess.inCheck()) {
        sounds.playCheck();
      }

      const newRecord: MoveRecord = {
        san: result.san,
        from: result.from,
        to: result.to,
        piece: result.piece,
        color: currentTurn,
        captured: result.captured,
        fen: chess.fen(),
        classification: 'best',
      };

      const updatedHistory = [...moveHistory, newRecord];
      setMoveHistory(updatedHistory);
      setCurrentMoveIndex(updatedHistory.length - 1);
      setLastMove({ from: result.from, to: result.to });

      // Update opening detection
      const sans = updatedHistory.map((m) => m.san);
      const op = detectOpening(sans);
      if (op) setOpeningName(op.name);

      const ended = checkGameEndConditions(chess);

      // Trigger bot move if applicable
      if (!ended && activeMode === 'bot' && chess.turn() === 'b') {
        triggerBotMove(chess);
      }

      // Auto-flip board in local 2 player mode
      if (activeMode === 'local') {
        setIsFlipped((prev) => !prev);
      }

      return true;
    } catch {
      return false;
    }
  };

  // Start new game / reset
  const handleNewGame = () => {
    const newChess = new Chess();
    setChess(newChess);
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setIsGameOver(false);
    setGameStatusText('');
    setOpeningName('');
    setLastMove(null);
    setWhiteCaptures([]);
    setBlackCaptures([]);
    setWhiteTime(timeControl.seconds);
    setBlackTime(timeControl.seconds);
    setIsFlipped(false);

    if (activeMode === 'bot') {
      setBotMessage(selectedBot.banter.start[Math.floor(Math.random() * selectedBot.banter.start.length)]);
    }
  };

  // Change time control
  const handleSelectTimeControl = (tc: TimeControl) => {
    setTimeControl(tc);
    setWhiteTime(tc.seconds);
    setBlackTime(tc.seconds);
  };

  // Resign
  const handleResign = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    sounds.playGameEnd(false);
    setGameStatusText(activeMode === 'bot' ? 'You resigned. Bot wins!' : 'White resigned.');
    if (activeMode === 'bot') {
      const winQuotes = selectedBot.banter.win;
      setBotMessage(winQuotes[Math.floor(Math.random() * winQuotes.length)]);
    }
  };

  // Draw offer
  const handleOfferDraw = () => {
    if (isGameOver) return;
    if (activeMode === 'bot') {
      // Nelson never accepts draws, Martin accepts sometimes
      if (selectedBot.id === 'martin') {
        setIsGameOver(true);
        sounds.playGameEnd(false);
        setGameStatusText('Draw agreed with Martin!');
        setBotMessage("Sure, a draw sounds great to me!");
      } else {
        setBotMessage("No draws! Let's play it out!");
      }
    } else {
      setIsGameOver(true);
      sounds.playGameEnd(false);
      setGameStatusText('Game drawn by mutual agreement.');
    }
  };

  // Navigate through move history
  const handleSelectMove = (index: number) => {
    setCurrentMoveIndex(index);
    if (index === -1) {
      setChess(new Chess());
      setLastMove(null);
    } else {
      const targetMove = moveHistory[index];
      setChess(new Chess(targetMove.fen));
      setLastMove({ from: targetMove.from, to: targetMove.to });
    }
  };

  // Players info
  const whitePlayer: PlayerInfo = {
    name: 'You',
    rating: 1200,
    avatar: '♟️',
    country: '🌐',
  };

  const blackPlayer: PlayerInfo = activeMode === 'bot'
    ? {
        name: selectedBot.name,
        rating: selectedBot.rating,
        avatar: selectedBot.avatar,
        country: '🤖',
        isBot: true,
      }
    : {
        name: 'Player 2',
        rating: 1200,
        avatar: '♞',
        country: '🌐',
      };

  // Material evaluation calculation
  const currentEval = evaluateBoard(chess);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#302e2b] text-[#c3c2c1]">
      {/* Bot Selection Modal */}
      <BotSelectionModal
        isOpen={botModalOpen}
        onClose={() => setBotModalOpen(false)}
        onSelectBot={(bot) => {
          setSelectedBot(bot);
          setActiveMode('bot');
          handleNewGame();
        }}
        currentBotId={selectedBot.id}
      />

      {/* Left Navigation Sidebar */}
      <Sidebar
        activeMode={activeMode}
        onSelectMode={(mode) => {
          setActiveMode(mode);
          if (mode === 'bot' || mode === 'local') {
            handleNewGame();
          }
        }}
        onOpenBotModal={() => setBotModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start p-2 sm:p-4 lg:p-6">
        {/* Render Active View */}
        {activeMode === 'puzzle' ? (
          <PuzzleView />
        ) : activeMode === 'analysis' ? (
          <AnalysisView
            gameHistory={moveHistory}
            whitePlayerName={whitePlayer.name}
            blackPlayerName={blackPlayer.name}
          />
        ) : (
          /* Game Mode: Bot or Pass & Play */
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-6 w-full max-w-6xl mx-auto h-full max-h-[880px]">
            {/* Board Section with Player Cards and Eval Bar */}
            <div className="flex items-center gap-2 sm:gap-3 w-full max-w-[620px]">
              {/* Left Vertical Evaluation Bar */}
              <div className="h-[460px] sm:h-[580px]">
                <EvalBar score={currentEval} isFlipped={isFlipped} />
              </div>

              {/* Main Board Column */}
              <div className="flex-1 flex flex-col gap-2">
                {/* Top Opponent Card */}
                <PlayerCard
                  player={isFlipped ? whitePlayer : blackPlayer}
                  timeRemaining={isFlipped ? whiteTime : blackTime}
                  isActiveTurn={chess.turn() === (isFlipped ? 'w' : 'b') && !isGameOver}
                  capturedPieces={isFlipped ? whiteCaptures : blackCaptures}
                  color={isFlipped ? 'w' : 'b'}
                />

                {/* The Chessboard */}
                <Chessboard
                  chess={chess}
                  isFlipped={isFlipped}
                  onMove={handleMove}
                  lastMove={lastMove}
                  interactive={!isGameOver && (currentMoveIndex === moveHistory.length - 1 || moveHistory.length === 0)}
                />

                {/* Bottom Player Card */}
                <PlayerCard
                  player={isFlipped ? blackPlayer : whitePlayer}
                  timeRemaining={isFlipped ? blackTime : whiteTime}
                  isActiveTurn={chess.turn() === (isFlipped ? 'b' : 'w') && !isGameOver}
                  capturedPieces={isFlipped ? blackCaptures : whiteCaptures}
                  color={isFlipped ? 'b' : 'w'}
                />
              </div>
            </div>

            {/* Right Side Hub Panel */}
            <div className="w-full lg:w-[340px] flex flex-col gap-3 h-[480px] sm:h-[620px]">
              {/* Bot Speech Bubble if playing Bot */}
              {activeMode === 'bot' && (
                <BotDialog bot={selectedBot} message={botMessage} />
              )}

              {/* Move Notation Sheet */}
              <div className="flex-1 min-h-[220px]">
                <MoveHistory
                  moves={moveHistory}
                  currentMoveIndex={currentMoveIndex}
                  onSelectMove={handleSelectMove}
                  openingName={openingName}
                  onFlipBoard={() => setIsFlipped((prev) => !prev)}
                />
              </div>

              {/* Game Action Controls */}
              <GameControls
                onResign={handleResign}
                onOfferDraw={handleOfferDraw}
                onNewGame={handleNewGame}
                isGameOver={isGameOver}
                gameStatusText={gameStatusText}
                selectedTimeControl={timeControl}
                onSelectTimeControl={handleSelectTimeControl}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
