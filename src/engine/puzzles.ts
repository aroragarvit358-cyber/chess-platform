import { TacticalPuzzle } from '../types/chess';

export const TACTICAL_PUZZLES: TacticalPuzzle[] = [
  {
    id: 'puzzle-1',
    title: 'Back-Rank Mate',
    theme: 'Back Rank Checkmate',
    rating: 850,
    fen: '6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1',
    playerColor: 'w',
    solutionMoves: ['Qe8#'],
    description: 'White to move. Deliver checkmate exploiting the trapped enemy king on the 8th rank.'
  },
  {
    id: 'puzzle-2',
    title: "Smothered Mate Pattern",
    theme: 'Mate in 2',
    rating: 1250,
    fen: '6k1/5ppp/8/8/8/5N2/5PPP/4R1K1 w - - 0 1',
    playerColor: 'w',
    solutionMoves: ['Re8#'],
    description: 'White to move and deliver a swift back-rank checkmate.'
  },
  {
    id: 'puzzle-3',
    title: 'Royal Fork',
    theme: 'Knight Fork',
    rating: 1100,
    fen: 'r1b1k2r/pppp1ppp/8/4q3/1bP5/2N1P3/PP3PPP/R2QKB1R w KQkq - 0 1',
    playerColor: 'w',
    solutionMoves: ['Qb3', 'Bxc3+', 'Qxc3'],
    description: 'White to move. Defend against the bishop pin and liquidate favorably.'
  },
  {
    id: 'puzzle-4',
    title: "Opera Box Mate",
    theme: 'Mate in 2',
    rating: 1450,
    fen: '4kb1r/p2n1ppp/4p3/1B1p4/3P4/4P3/PP1B1PPP/R3K2R w KQk - 0 1',
    playerColor: 'w',
    solutionMoves: ['Rc1', 'Bd6', 'Rc8+'],
    description: 'White to move. Seize the open c-file and infiltrate into Black’s camp.'
  },
  {
    id: 'puzzle-5',
    title: 'Greek Gift Sacrifice',
    theme: 'Kingside Attack',
    rating: 1650,
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 1',
    playerColor: 'w',
    solutionMoves: ['Bxh7+', 'Kxh7', 'Ng5+'],
    description: 'White to move. Break open Black’s kingside castle with a classic sacrifice.'
  },
  {
    id: 'puzzle-6',
    title: "Anastasia's Mate",
    theme: 'Mate in 2',
    rating: 1550,
    fen: '5rk1/1p3ppp/8/8/4N3/8/5PPP/1R4K1 w - - 0 1',
    playerColor: 'w',
    solutionMoves: ['Rxb7'],
    description: 'White to move. Regain material with an active knight supporting the rook.'
  },
  {
    id: 'puzzle-7',
    title: 'Queen Trap',
    theme: 'Trapped Piece',
    rating: 1350,
    fen: 'r1b1k2r/pp1p1ppp/2n1p3/q7/2PP4/2P2N2/P1Q2PPP/R1B1KB1R b KQkq - 0 1',
    playerColor: 'b',
    solutionMoves: ['Nxd4', 'Nxd4', 'Qe5+'],
    description: 'Black to move. Win a central pawn with a tactical sequence.'
  }
];
