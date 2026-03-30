import { Component, computed, inject, input, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ChessService } from '../shared/services/chess-service';
import { GameService } from '../shared/services/game-service';
import { ChessPiece, PieceColor, PIECE_SYMBOLS } from '../shared/models/chess';

/** Taille fixe (px) des étiquettes de coordonnées (rangs / colonnes). */
const COORD_SIZE = 18;

@Component({
  selector: 'app-chess',
  imports: [TranslatePipe],
  templateUrl: './chess.component.html',
  styleUrl: './chess.component.scss'
})
export class ChessComponent implements OnInit {

  /** En mode popup, ce composant est affiché seul dans une fenêtre séparée. */
  popupMode = input<boolean>(false);
  /** Couleur imposée (utilisée en mode popup via les params URL). */
  overrideColor = input<PieceColor | null>(null);
  /**
   * Largeur (px) du conteneur parent.
   * L'échiquier occupe ~90 % de cette largeur.
   * Valeur par défaut : 450 (fenêtre popup ou panneau initial).
   */
  containerWidth = input<number>(450);

  private readonly chessService = inject(ChessService);
  private readonly gameService = inject(GameService);

  protected readonly board = this.chessService.board;
  protected readonly selectedSquare = this.chessService.selectedSquare;

  protected readonly rows = [0, 1, 2, 3, 4, 5, 6, 7];
  protected readonly cols = [0, 1, 2, 3, 4, 5, 6, 7];

  /** Taille d'une cellule en px, calculée pour que l'échiquier occupe ~90 % de containerWidth. */
  protected readonly cellSize = computed<number>(() => {
    const available = this.containerWidth() * 0.9 - 2 * COORD_SIZE;
    return Math.max(28, Math.min(80, Math.floor(available / 8)));
  });

  /** Taille de police des pièces, proportionnelle à la cellule. */
  protected readonly pieceFont = computed<number>(() =>
    Math.floor(this.cellSize() * 0.68)
  );

  /** Exposé au template pour les dimensions des étiquettes. */
  protected readonly coordSize = COORD_SIZE;

  protected readonly playerColor = computed<PieceColor>(() =>
    this.overrideColor() ?? this.gameService.player().color
  );

  ngOnInit(): void {
    if (this.popupMode()) {
      this.chessService.initAsPopup();
    }
  }

  protected onCellClick(row: number, col: number): void {
    this.chessService.selectOrMove(row, col, this.playerColor());
  }

  protected getPieceSymbol(piece: ChessPiece): string {
    return PIECE_SYMBOLS[piece.color][piece.type];
  }

  protected isLightSquare(row: number, col: number): boolean {
    return (row + col) % 2 === 0;
  }

  protected isSelected(row: number, col: number): boolean {
    const sel = this.selectedSquare();
    return sel !== null && sel.row === row && sel.col === col;
  }

  protected colLabel(col: number): string {
    return String.fromCharCode(97 + col); // a–h
  }

  protected rowLabel(row: number): string {
    return String(8 - row); // 8–1
  }

  protected resetBoard(): void {
    this.chessService.resetBoard();
  }

  protected openInWindow(): void {
    this.chessService.openPopup();
  }

  protected closeChess(): void {
    this.chessService.chessVisible.set(false);
  }
}
