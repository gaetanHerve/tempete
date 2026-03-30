import { inject, Injectable, signal } from '@angular/core';
import { ChessBoard, PieceColor, createInitialBoard } from '../models/chess';
import { GameService } from './game-service';
import { GameSocketService } from './gameSocket-service';

@Injectable({ providedIn: 'root' })
export class ChessService {

  private readonly gameService = inject(GameService);
  private readonly gameSocketService = inject(GameSocketService);

  board = signal<ChessBoard>(createInitialBoard());
  selectedSquare = signal<{ row: number; col: number } | null>(null);
  chessVisible = signal<boolean>(false);

  private popupWindow: Window | null = null;
  private bc: BroadcastChannel | null = null;
  private isPopupMode = false;

  /** Appelé par AppComponent dans la fenêtre principale. */
  initAsMain(): void {
    this.bc = new BroadcastChannel('tempete-chess');
    this.bc.onmessage = (e) => {
      if (e.data.type === 'request-sync') {
        this.bc!.postMessage({ type: 'sync', board: this.board() });
      } else if (e.data.type === 'move') {
        this.board.set(e.data.board);
        this.syncViaSocket();
      }
    };
    this.gameSocketService.onChessMove().subscribe((board: ChessBoard) => {
      this.board.set(board);
      this.bc?.postMessage({ type: 'sync', board });
    });
  }

  /** Appelé par ChessComponent dans la fenêtre popup. */
  initAsPopup(): void {
    this.isPopupMode = true;
    this.bc = new BroadcastChannel('tempete-chess');
    this.bc.onmessage = (e) => {
      if (e.data.type === 'sync') {
        this.board.set(e.data.board);
      }
    };
    // Demander l'état initial au bout d'un court délai (la fenêtre principale peut ne pas être prête instantanément)
    setTimeout(() => this.bc!.postMessage({ type: 'request-sync' }), 100);
  }

  /** Gère un clic sur une case. Seules les pièces de la couleur du joueur sont sélectionnables. */
  selectOrMove(row: number, col: number, playerColor: PieceColor): void {
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

    // Déplacer la pièce (mouvement libre)
    const newBoard: ChessBoard = this.board().map(r => [...r]);
    newBoard[row][col] = newBoard[selected.row][selected.col];
    newBoard[selected.row][selected.col] = null;
    this.board.set(newBoard);
    this.selectedSquare.set(null);

    if (this.isPopupMode) {
      this.bc?.postMessage({ type: 'move', board: this.board() });
    } else {
      this.syncViaSocket();
      this.bc?.postMessage({ type: 'sync', board: this.board() });
    }
  }

  resetBoard(): void {
    this.board.set(createInitialBoard());
    this.selectedSquare.set(null);
    if (this.isPopupMode) {
      this.bc?.postMessage({ type: 'move', board: this.board() });
    } else {
      this.syncViaSocket();
      this.bc?.postMessage({ type: 'sync', board: this.board() });
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
