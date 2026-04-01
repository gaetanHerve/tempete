import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CAPTURED_PIECE_ORDER, ChessBoard, ChessPiece, INITIAL_PIECE_COUNTS,
  MoveResult, PieceColor, PieceType, createInitialBoard, getLegalMoves
} from '../models/chess';
import { GameService } from './game-service';
import { GameSocketService } from './gameSocket-service';

@Injectable({ providedIn: 'root' })
export class ChessService {

  private readonly gameService = inject(GameService);
  private readonly gameSocketService = inject(GameSocketService);

  board = signal<ChessBoard>(createInitialBoard());
  selectedSquare = signal<{ row: number; col: number } | null>(null);
  chessVisible = signal<boolean>(false);
  freeMode = signal<boolean>(false);
  currentTurn = signal<PieceColor>('white');

  private readonly _legalMovesResult = computed<MoveResult>(() => {
    const sel = this.selectedSquare();
    if (!sel || this.freeMode()) return { moves: [], captures: [] };
    return getLegalMoves(this.board(), sel.row, sel.col);
  });

  readonly legalMoves = computed(() => this._legalMovesResult().moves);
  readonly captureSquares = computed(() => this._legalMovesResult().captures);

  readonly capturedByColor = (color: PieceColor) => computed<ChessPiece[]>(() => {
    const board = this.board();
    const counts: Partial<Record<PieceType, number>> = {};
    for (const row of board)
      for (const cell of row)
        if (cell?.color === color) counts[cell.type] = (counts[cell.type] ?? 0) + 1;
    const result: ChessPiece[] = [];
    for (const type of CAPTURED_PIECE_ORDER) {
      const diff = INITIAL_PIECE_COUNTS[type] - (counts[type] ?? 0);
      for (let i = 0; i < diff; i++) result.push({ type, color });
    }
    return result;
  });

  readonly capturedWhite = this.capturedByColor('white');
  readonly capturedBlack = this.capturedByColor('black');

  private popupWindow: Window | null = null;
  private bc: BroadcastChannel | null = null;
  private isPopupMode = false;

  /** Appelé par AppComponent dans la fenêtre principale. */
  initAsMain(): void {
    this.bc = new BroadcastChannel('tempete-chess');
    this.bc.onmessage = (e) => {
      if (e.data.type === 'request-sync') {
        this.bc!.postMessage({ type: 'sync', board: this.board(), currentTurn: this.currentTurn() });
      } else if (e.data.type === 'move') {
        this.board.set(e.data.board);
        if (e.data.currentTurn) this.currentTurn.set(e.data.currentTurn);
        this.syncViaSocket();
      }
    };
    this.gameSocketService.onChessMove().subscribe((board: ChessBoard) => {
      this.board.set(board);
      this.currentTurn.update(t => t === 'white' ? 'black' : 'white');
      this.bc?.postMessage({ type: 'sync', board, currentTurn: this.currentTurn() });
    });
  }

  /** Appelé par ChessComponent dans la fenêtre popup. */
  initAsPopup(): void {
    this.isPopupMode = true;
    this.bc = new BroadcastChannel('tempete-chess');
    this.bc.onmessage = (e) => {
      if (e.data.type === 'sync') {
        this.board.set(e.data.board);
        if (e.data.currentTurn) this.currentTurn.set(e.data.currentTurn);
      }
    };
    // Demander l'état initial au bout d'un court délai (la fenêtre principale peut ne pas être prête instantanément)
    setTimeout(() => this.bc!.postMessage({ type: 'request-sync' }), 100);
  }

  /** Gère un clic sur une case. Seules les pièces de la couleur du joueur sont sélectionnables. */
  selectOrMove(row: number, col: number, playerColor: PieceColor): void {
    // En mode règles strictes : bloquer si ce n'est pas le tour du joueur
    if (!this.freeMode() && playerColor !== this.currentTurn()) return;

    const selected = this.selectedSquare();
    const piece = this.board()[row][col];

    if (!selected) {
      if (piece && piece.color === playerColor) {
        this.selectedSquare.set({ row, col });
      }
      return;
    }

    // Désélectionner si on reclique la même case
    if (selected.row === row && selected.col === col) {
      this.selectedSquare.set(null);
      return;
    }

    // Changer de sélection si on clique une autre pièce de sa couleur
    if (piece && piece.color === playerColor) {
      this.selectedSquare.set({ row, col });
      return;
    }

    // En mode règles strictes : vérifier que la destination est un coup légal
    if (!this.freeMode()) {
      const result = this._legalMovesResult();
      const isLegal = [...result.moves, ...result.captures].some(t => t.row === row && t.col === col);
      if (!isLegal) {
        this.selectedSquare.set(null);
        return;
      }
    }

    // Déplacer la pièce
    const newBoard: ChessBoard = this.board().map(r => [...r]);
    newBoard[row][col] = newBoard[selected.row][selected.col];
    newBoard[selected.row][selected.col] = null;
    this.board.set(newBoard);
    this.selectedSquare.set(null);
    this.currentTurn.update(t => t === 'white' ? 'black' : 'white');

    if (this.isPopupMode) {
      this.bc?.postMessage({ type: 'move', board: this.board(), currentTurn: this.currentTurn() });
    } else {
      this.syncViaSocket();
      this.bc?.postMessage({ type: 'sync', board: this.board(), currentTurn: this.currentTurn() });
    }
  }

  resetBoard(): void {
    this.board.set(createInitialBoard());
    this.selectedSquare.set(null);
    this.currentTurn.set('white');
    if (this.isPopupMode) {
      this.bc?.postMessage({ type: 'move', board: this.board(), currentTurn: this.currentTurn() });
    } else {
      this.syncViaSocket();
      this.bc?.postMessage({ type: 'sync', board: this.board(), currentTurn: this.currentTurn() });
    }
  }

  openPopup(): void {
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.focus();
      return;
    }
    const player = this.gameService.player();
    const params = new URLSearchParams({
      chess: 'popup',
      color: player.color,
      player: player.number
    });
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    this.popupWindow = window.open(url, 'tempete-chess', 'width=430,height=510,menubar=no,toolbar=no,location=no,resizable=yes');
  }

  private syncViaSocket(): void {
    const roomCode = this.gameService.roomCode();
    if (!roomCode) return;
    this.gameSocketService.sendChessMove(roomCode, this.board());
  }
}
