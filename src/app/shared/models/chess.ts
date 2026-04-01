export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type ChessBoard = (ChessPiece | null)[][];

export interface MoveResult {
  moves: { row: number; col: number }[];
  captures: { row: number; col: number }[];
}

/** Ordre d'affichage des pièces capturées (de la plus précieuse à la moins précieuse). */
export const CAPTURED_PIECE_ORDER: PieceType[] = ['queen', 'rook', 'bishop', 'knight', 'pawn'];

/** Nombre initial de chaque pièce par couleur en position de départ. */
export const INITIAL_PIECE_COUNTS: Record<PieceType, number> = {
  king: 1, queen: 1, rook: 2, bishop: 2, knight: 2, pawn: 8
};

// Les deux couleurs utilisent les symboles pleins (♚♛…) — les symboles "blancs" (♔♕…)
// sont creux par nature. La couleur visuelle est gérée via CSS (.white-piece).
export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
};

export function createInitialBoard(): ChessBoard {
  const b: ChessBoard = Array.from({ length: 8 }, () => Array(8).fill(null));
  const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  backRank.forEach((type, col) => { b[0][col] = { type, color: 'black' }; });
  for (let col = 0; col < 8; col++) b[1][col] = { type: 'pawn', color: 'black' };
  for (let col = 0; col < 8; col++) b[6][col] = { type: 'pawn', color: 'white' };
  backRank.forEach((type, col) => { b[7][col] = { type, color: 'white' }; });
  return b;
}

// ─── Chess rules engine ───────────────────────────────────────────────────────

function onBoard(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

/** Squares attacked by a piece (regardless of whether they are occupied by an ally). */
function attackSquares(board: ChessBoard, row: number, col: number): { row: number; col: number }[] {
  const piece = board[row][col];
  if (!piece) return [];
  const { type, color } = piece;
  const sq: { row: number; col: number }[] = [];

  const slide = (dr: number, dc: number) => {
    let r = row + dr, c = col + dc;
    while (onBoard(r, c)) {
      sq.push({ row: r, col: c });
      if (board[r][c]) break;
      r += dr; c += dc;
    }
  };

  switch (type) {
    case 'pawn': {
      const dir = color === 'white' ? -1 : 1;
      if (onBoard(row + dir, col - 1)) sq.push({ row: row + dir, col: col - 1 });
      if (onBoard(row + dir, col + 1)) sq.push({ row: row + dir, col: col + 1 });
      break;
    }
    case 'knight':
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        if (onBoard(row + dr, col + dc)) sq.push({ row: row + dr, col: col + dc });
      }
      break;
    case 'bishop':
      for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) slide(dr, dc);
      break;
    case 'rook':
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) slide(dr, dc);
      break;
    case 'queen':
      for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) slide(dr, dc);
      break;
    case 'king':
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        if (onBoard(row + dr, col + dc)) sq.push({ row: row + dr, col: col + dc });
      }
      break;
  }
  return sq;
}

/** Returns true if the king of `color` is currently in check. */
export function isInCheck(board: ChessBoard, color: PieceColor): boolean {
  let kr = -1, kc = -1;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.type === 'king' && board[r][c]?.color === color) { kr = r; kc = c; }
  if (kr === -1) return false;
  const enemy = color === 'white' ? 'black' : 'white';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === enemy)
        if (attackSquares(board, r, c).some(s => s.row === kr && s.col === kc)) return true;
  return false;
}

/** Raw pseudo-legal moves (no check filtering). */
function getRawMoves(board: ChessBoard, row: number, col: number): MoveResult {
  const piece = board[row][col];
  if (!piece) return { moves: [], captures: [] };
  const { type, color } = piece;
  const enemy = color === 'white' ? 'black' : 'white';
  const moves: { row: number; col: number }[] = [];
  const captures: { row: number; col: number }[] = [];

  const slide = (dr: number, dc: number) => {
    let r = row + dr, c = col + dc;
    while (onBoard(r, c)) {
      if (!board[r][c]) { moves.push({ row: r, col: c }); }
      else { if (board[r][c]!.color === enemy) captures.push({ row: r, col: c }); break; }
      r += dr; c += dc;
    }
  };

  switch (type) {
    case 'pawn': {
      const dir = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;
      if (onBoard(row + dir, col) && !board[row + dir][col]) {
        moves.push({ row: row + dir, col });
        if (row === startRow && !board[row + 2 * dir][col])
          moves.push({ row: row + 2 * dir, col });
      }
      for (const dc of [-1, 1])
        if (onBoard(row + dir, col + dc) && board[row + dir][col + dc]?.color === enemy)
          captures.push({ row: row + dir, col: col + dc });
      break;
    }
    case 'knight':
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        const r = row + dr, c = col + dc;
        if (!onBoard(r, c)) continue;
        if (!board[r][c]) moves.push({ row: r, col: c });
        else if (board[r][c]!.color === enemy) captures.push({ row: r, col: c });
      }
      break;
    case 'bishop':
      for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) slide(dr, dc);
      break;
    case 'rook':
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) slide(dr, dc);
      break;
    case 'queen':
      for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) slide(dr, dc);
      break;
    case 'king':
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        const r = row + dr, c = col + dc;
        if (!onBoard(r, c)) continue;
        if (!board[r][c]) moves.push({ row: r, col: c });
        else if (board[r][c]!.color === enemy) captures.push({ row: r, col: c });
      }
      break;
  }
  return { moves, captures };
}

/** Legal moves: filters out moves that would leave the king in check. */
export function getLegalMoves(board: ChessBoard, row: number, col: number): MoveResult {
  const piece = board[row][col];
  if (!piece) return { moves: [], captures: [] };
  const { moves, captures } = getRawMoves(board, row, col);

  const legal = (target: { row: number; col: number }) => {
    const next = board.map(r => [...r]);
    next[target.row][target.col] = next[row][col];
    next[row][col] = null;
    return !isInCheck(next, piece.color);
  };

  return { moves: moves.filter(legal), captures: captures.filter(legal) };
}
