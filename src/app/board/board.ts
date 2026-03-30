import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Toolbar } from "../toolbar/toolbar";
import { Hand } from '../hand/hand';
import { Stack } from '../stack/stack';
import { Discard } from '../discard/discard';
import { PlayArea } from '../play-area/play-area';
import { GameService } from '../shared/services/game-service';
import { ChessService } from '../shared/services/chess-service';
import { ChessComponent } from '../chess/chess.component';

@Component({
  selector: 'app-board',
  imports: [Toolbar, Hand, Stack, Discard, PlayArea, ChessComponent],
  templateUrl: './board.html',
  styleUrl: './board.scss'
})
export class Board implements OnInit, OnDestroy {

  private readonly gameService = inject(GameService);
  protected readonly chessService = inject(ChessService);
  protected player: 'player1' | 'player2' = 'player1';

  /** Largeur courante du panneau (px), modifiable par drag. */
  protected readonly chessWidth = signal<number>(450);
  /** Désactive les transitions CSS pendant le redimensionnement. */
  protected readonly resizing = signal<boolean>(false);

  /**
   * Position `right` du panneau fixe :
   *  - ouvert  → 0          (flush avec le bord droit)
   *  - fermé   → -largeur   (hors écran)
   */
  protected readonly panelRight = computed(() =>
    this.chessService.chessVisible() ? 0 : -this.chessWidth()
  );

  /**
   * Largeur du spacer flex (réserve l'espace pour l'effet push) :
   *  - ouvert  → chessWidth
   *  - fermé   → 0
   */
  protected readonly spacerWidth = computed(() =>
    this.chessService.chessVisible() ? this.chessWidth() : 0
  );

  /**
   * Position `right` de la languette fixe :
   *  - ouvert  → chessWidth (collée au bord gauche du panneau)
   *  - fermé   → 0          (collée au bord droit de l'écran)
   */
  protected readonly tabRight = computed(() =>
    this.chessService.chessVisible() ? this.chessWidth() : 0
  );

  private startX = 0;
  private startWidth = 0;

  private readonly onMouseMoveBound = (e: MouseEvent) => this.onResizeMove(e);
  private readonly onMouseUpBound = () => this.resizing.set(false);

  constructor() {
    effect(() => {
      this.player = this.gameService.player().number;
    });
  }

  ngOnInit(): void {
    document.addEventListener('mousemove', this.onMouseMoveBound);
    document.addEventListener('mouseup', this.onMouseUpBound);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMouseMoveBound);
    document.removeEventListener('mouseup', this.onMouseUpBound);
  }

  protected toggleChess(): void {
    this.chessService.chessVisible.update(v => !v);
  }

  protected onResizeStart(event: MouseEvent): void {
    this.resizing.set(true);
    this.startX = event.clientX;
    this.startWidth = this.chessWidth();
    event.preventDefault();
  }

  private onResizeMove(event: MouseEvent): void {
    if (!this.resizing()) return;
    // Glisser vers la gauche agrandit le panneau
    const delta = this.startX - event.clientX;
    const maxWidth = Math.floor(window.innerWidth * 0.65);
    const newWidth = Math.max(350, Math.min(maxWidth, this.startWidth + delta));
    this.chessWidth.set(newWidth);
  }
}
