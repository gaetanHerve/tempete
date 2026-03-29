import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../shared/services/game-service';
import { ErrorComponent } from '../shared/components/error-component/error-component';

@Component({
  selector: 'app-toolbar',
  imports: [ErrorComponent, FormsModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class Toolbar {

  private readonly gameService = inject(GameService);

  protected gameStarted = signal<boolean>(false);
  protected roomCode = this.gameService.roomCode;
  protected showJoinInput = signal<boolean>(false);
  protected joinCodeInput = '';

  protected startGame() {
    if (!this.gameService.gameStarted) {
      this.gameService.createGame(() => this.gameStarted.set(true));
    }
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
    this.joinCodeInput = '';
  }

  protected shufflePile() {
    this.gameService.shufflePile('player1');
    this.gameService.shufflePile('player2');
  }

}
