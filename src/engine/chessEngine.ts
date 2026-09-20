import { Chess, Move, PieceSymbol, Square } from 'chess.js';
import { BotProfile } from '../types/chess';

// Piece values in centipawns
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-Square Tables (White perspective; flipped for Black)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

function getSquareIndex(square: Square, color: 'w' | 'b'): number {
  const file = square.charCodeAt(0) - 97; // 0 to 7
  const rank = parseInt(square[1], 10) - 1; // 0 to 7
  if (color === 'w') {
    return (7 - rank) * 8 + file;
  } else {
    return rank * 8 + file;
  }
}

export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 0;
  }

  let whiteScore = 0;
  let blackScore = 0;

  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type];
      const sq = (String.fromCharCode(97 + c) + (8 - r)) as Square;
      const sqIdx = getSquareIndex(sq, piece.color);

      let posBonus = 0;
      switch (piece.type) {
        case 'p': posBonus = PAWN_TABLE[sqIdx]; break;
        case 'n': posBonus = KNIGHT_TABLE[sqIdx]; break;
        case 'b': posBonus = BISHOP_TABLE[sqIdx]; break;
        case 'r': posBonus = ROOK_TABLE[sqIdx]; break;
        case 'q': posBonus = QUEEN_TABLE[sqIdx]; break;
        case 'k': posBonus = KING_TABLE[sqIdx]; break;
      }

      if (piece.color === 'w') {
        whiteScore += baseVal + posBonus;
      } else {
        blackScore += baseVal + posBonus;
      }
    }
  }

  // Mobility
  const moves = chess.moves({ verbose: true });
  const mobility = moves.length * 5;
  if (chess.turn() === 'w') {
    whiteScore += mobility;
  } else {
    blackScore += mobility;
  }

  return whiteScore - blackScore;
}

// Alpha-Beta Minimax search
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; bestMove?: Move } {
  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluateBoard(chess) };
  }

  const moves = chess.moves({ verbose: true });
  // Move ordering: prioritize captures
  moves.sort((a, b) => {
    const scoreA = a.captured ? PIECE_VALUES[a.captured] - PIECE_VALUES[a.piece] / 10 : 0;
    const scoreB = b.captured ? PIECE_VALUES[b.captured] - PIECE_VALUES[b.piece] / 10 : 0;
    return scoreB - scoreA;
  });

  let bestMove: Move | undefined = moves[0];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();

      if (evaluation.score > maxEval) {
        maxEval = evaluation.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, evaluation.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();

      if (evaluation.score < minEval) {
        minEval = evaluation.score;
        bestMove = move;
      }
      beta = Math.min(beta, evaluation.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, bestMove };
  }
}

// Select best move based on bot profile
export function getBotMove(chess: Chess, bot: BotProfile): Move | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Nelson's special bias: Bring out Queen / attack with Queen!
  if (bot.id === 'nelson' && Math.random() < 0.6) {
    const queenMoves = moves.filter(m => m.piece === 'q');
    if (queenMoves.length > 0) {
      // Prioritize queen attacks / captures
      const captureQueenMove = queenMoves.find(m => !!m.captured);
      if (captureQueenMove) return captureQueenMove;
      // Or move Queen forward
      return queenMoves[Math.floor(Math.random() * queenMoves.length)];
    }
  }

  // Random blunder chance for beginner bots (Martin, Jimmy)
  if (Math.random() < bot.randomness) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const isWhite = chess.turn() === 'w';
  const result = minimax(chess, bot.depth, -Infinity, Infinity, isWhite);
  return result.bestMove || moves[0];
}

export const BOT_PROFILES: BotProfile[] = [
  {
    id: 'martin',
    name: 'Martin',
    rating: 250,
    avatar: '👨‍👧‍👦',
    description: 'Martin is a friendly dad who just learned how the pieces move. He loves playing, even if he blunders!',
    quote: "I'm just happy to be here playing chess with you!",
    depth: 1,
    randomness: 0.65,
    aggression: 0.2,
    avatarBg: 'bg-emerald-700',
    difficulty: 'Beginner',
    banter: {
      start: [
        "Hi! Don't worry, my kids beat me all the time.",
        "Let's have a fun game! May the best player win.",
        "I hope I remember how the knight moves!"
      ],
      moveGood: [
        "Wait, was that a good move? I totally meant to do that.",
        "Oh wow, look at that piece go!",
        "My son taught me that trick yesterday."
      ],
      moveBad: [
        "Oops... was that my queen?",
        "Can I get a takeback? Just kidding!",
        "I didn't need that bishop anyway."
      ],
      capture: [
        "Hey, thanks for the piece!",
        "Nom nom nom, captured!",
        "I got one! Let me call my wife."
      ],
      check: [
        "Check! That means your king has to run, right?",
        "Look out, king incoming!",
        "Check! Did I do that right?"
      ],
      win: [
        "Wait, did I actually win?! Somebody pinch me!",
        "I can't wait to tell the family I won a game!",
        "Good game! Rematch anytime."
      ],
      loss: [
        "Good game! You are way too good for me.",
        "Ah well, time to go make dinner. Well played!",
        "That was awesome, you're a grandmaster in the making!"
      ]
    }
  },
  {
    id: 'jimmy',
    name: 'Jimmy',
    rating: 600,
    avatar: '👦',
    description: 'Jimmy is an enthusiastic school player who loves grabbing free pieces and pushing pawns.',
    quote: "Watch out for my surprise attacks!",
    depth: 2,
    randomness: 0.35,
    aggression: 0.5,
    avatarBg: 'bg-blue-700',
    difficulty: 'Beginner',
    banter: {
      start: [
        "Ready to play! Let's see your best opening.",
        "I've been studying on my tablet all week!",
        "Good luck, you'll need it against my pawns!"
      ],
      moveGood: [
        "My coach showed me that exact tactic!",
        "Pressure is on you now!",
        "Solid move, right?"
      ],
      moveBad: [
        "Hey! That wasn't supposed to happen.",
        "Uh oh, gotta regroup.",
        "Hmm, maybe that wasn't ideal."
      ],
      capture: [
        "Free material! Don't mind if I do.",
        "One step closer to victory.",
        "Captured! My army is growing."
      ],
      check: [
        "Check! Watch your back!",
        "King under siege!",
        "Check! Where are you going to run?"
      ],
      win: [
        "Yes!! High five! Great game!",
        "That was epic! Want another round?",
        "Woohoo, my tactics paid off!"
      ],
      loss: [
        "Aww man, you got me good. Rematch?",
        "That was a sweet checkmate. Well played!",
        "I'll get you next time!"
      ]
    }
  },
  {
    id: 'nelson',
    name: 'Nelson',
    rating: 1300,
    avatar: '🧔',
    description: 'Nelson is infamous for launching his Queen early into the battle. He plays aggressively and searches for quick checkmates.',
    quote: "My Queen is hungry. Prepare yourself!",
    depth: 3,
    randomness: 0.15,
    aggression: 0.9,
    avatarBg: 'bg-amber-700',
    difficulty: 'Intermediate',
    banter: {
      start: [
        "Get ready: my Queen doesn't like staying on the back rank.",
        "I play to win fast. Let's see if you can defend!",
        "Classic battle time. Let the fireworks begin."
      ],
      moveGood: [
        "My Queen dominates the board!",
        "Can you feel the heat yet?",
        "Attacking is the best defense."
      ],
      moveBad: [
        "A slight hiccup. My Queen will find another way.",
        "Don't celebrate too early.",
        "You think you trapped me?"
      ],
      capture: [
        "Crunch! Another one bites the dust.",
        "Your defense is crumbling piece by piece.",
        "Delicious! Thank you."
      ],
      check: [
        "CHECK! Your king is in crosshairs.",
        "No safe squares for your king!",
        "Check! The walls are closing in."
      ],
      win: [
        "And that's why the Queen attacks early. GG!",
        "Flawless checkmate! You put up a good fight.",
        "Victory for the aggressive style!"
      ],
      loss: [
        "Incredible defense. You managed to tame my attack. Well played!",
        "You punished my overextension. Hats off to you.",
        "Well fought. Let's run it back!"
      ]
    }
  },
  {
    id: 'wendy',
    name: 'Wendy',
    rating: 1700,
    avatar: '👩‍💼',
    description: 'Wendy is a disciplined club player with excellent positional instincts, pawn structure awareness, and sharp endgame skill.',
    quote: "Every pawn move creates a permanent weakness. Choose carefully.",
    depth: 3,
    randomness: 0.05,
    aggression: 0.6,
    avatarBg: 'bg-purple-700',
    difficulty: 'Advanced',
    banter: {
      start: [
        "Hello! Looking forward to a high quality game of chess.",
        "Focus on pawn structure and king safety.",
        "Let's test our classical understanding."
      ],
      moveGood: [
        "Improving my piece coordination seamlessly.",
        "A subtle positional squeeze.",
        "Controlling the open file."
      ],
      moveBad: [
        "An unexpected reply. Interesting counterplay.",
        "You found an energetic resource.",
        "I need to recalculate this variation."
      ],
      capture: [
        "Trading into a favorable endgame.",
        "Liquidating your defenders.",
        "Positional advantage secured."
      ],
      check: [
        "Check. Forcing your king out into the open.",
        "Tempo gained with check.",
        "Check. Defense is getting tricky."
      ],
      win: [
        "Checkmate. Precision in the endgame made the difference. Thank you for the game!",
        "Good game! Your opening was quite strong.",
        "A well-contested strategic battle."
      ],
      loss: [
        "Brilliant performance! You outplayed me completely. Congratulations!",
        "Magnificent technique in that conversion. Respect!",
        "A well-deserved win. I learned a lot from this game."
      ]
    }
  },
  {
    id: 'magnus',
    name: 'Magnus Bot',
    rating: 2800,
    avatar: '👑',
    description: 'Inspired by the World Champion. Combines relentless endgame grinding, deep tactical calculation, and unbreakable defense.',
    quote: "Some people think that if their opponent plays a beautiful game, it's okay to lose. I don't.",
    depth: 4,
    randomness: 0.0,
    aggression: 0.7,
    avatarBg: 'bg-yellow-600',
    difficulty: 'Master',
    banter: {
      start: [
        "Let's play some good chess. Make every move count.",
        "I will test every single weakness in your position.",
        "No easy draws here."
      ],
      moveGood: [
        "The squeeze begins. Slowly increasing the pressure.",
        "You will slowly run out of productive moves.",
        "Precision in every phase."
      ],
      moveBad: [
        "You found a resilient defense. Impressive.",
        "Sharp move. Let's see your continuation.",
        "The game is still alive."
      ],
      capture: [
        "Material equality is broken. Conversion starts now.",
        "Pawn majority on the queenside.",
        "A clean exchange."
      ],
      check: [
        "Check. The king has nowhere to hide.",
        "Forced king displacement.",
        "Check. The net is cast."
      ],
      win: [
        "Checkmate. Clinical technique from start to finish. Good game.",
        "As expected, the endgame proved decisive. Well played.",
        "Thank you for the game. Keep studying."
      ],
      loss: [
        "Unbelievable! You beat me! World champion level accuracy. Outstanding game!",
        "Incredible tactical brilliance. You earned this victory 100%!",
        "I take my hat off to you. Truly extraordinary play!"
      ]
    }
  }
];
