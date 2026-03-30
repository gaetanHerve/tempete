export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type ChessBoard = (ChessPiece | null)[][];

export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
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
