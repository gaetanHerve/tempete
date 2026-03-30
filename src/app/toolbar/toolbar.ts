import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { GameService } from '../shared/services/game-service';
import { ChessService } from '../shared/services/chess-service';
import { TranslationService } from '../shared/services/translation-service';
import { ErrorComponent } from '../shared/components/error-component/error-component';

@Component({
  selector: 'app-toolbar',
  imports: [ErrorComponent, FormsModule, TranslatePipe],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class Toolbar {

  private readonly gameService = inject(GameService);
  private readonly chessService = inject(ChessService);
  protected readonly translationService = inject(TranslationService);
  protected readonly chessVisible = this.chessService.chessVisible;

  protected gameStarted = signal<boolean>(false);
  protected roomCode = this.gameService.roomCode;
  protected showJoinInput = signal<boolean>(false);
  protected showColorPicker = signal<boolean>(false);
  protected joinCodeInput = '';
  protected currentTurn = this.gameService.currentTurn;
  protected localPlayer = this.gameService.player;
  protected pendingAction = this.gameService.pendingAction;
  protected confirmingReset = signal<boolean>(false);
  protected confirmingLeave = signal<boolean>(false);

  protected openColorPicker() {
    this.showColorPicker.set(true);
  }

  protected createWithColor(color: 'white' | 'black') {
    this.showColorPicker.set(false);
    this.gameService.createGame(color, () => this.gameStarted.set(true));
  }

  protected showJoinForm() {
    this.showJoinInput.set(true);
  }

  protected confirmJoin() {
    const code = this.joinCodeInput.trim().toUpperCase();
    if (code) {
      this.gameService.joinGame(code);
      this.showJoinInput.set(false);
      this.gameStarted.set(true);
    }
  }

  protected resetGame() {
    this.gameService.resetGame();
    this.gameStarted.set(false);
    this.showJoinInput.set(false);
    this.showColorPicker.set(false);
    this.joinCodeInput = '';
    this.confirmingReset.set(false);
  }

  protected leaveGame() {
    this.gameService.resetGame();
    this.gameStarted.set(false);
    this.confirmingLeave.set(false);
  }

  protected confirmAction() {
    this.gameService.confirmPendingAction();
  }

  protected cancelAction() {
    this.gameService.cancelPendingAction();
  }

  protected endTurn() {
    this.gameService.endTurn();
  }

  protected toggleChess() {
    this.chessService.chessVisible.update(v => !v);
  }

  protected shufflePile() {
    this.gameService.shufflePile('player1');
    this.gameService.shufflePile('player2');
  }

}
