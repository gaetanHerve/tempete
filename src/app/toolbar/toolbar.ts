import { Component, inject, signal } from '@angular/core';
import { GameService } from '../shared/services/game-service';
import { ErrorComponent } from '../shared/components/error-component/error-component';
import { ErrorService } from '../shared/services/error-service';
import { Player } from '../shared/models/player';

@Component({
  selector: 'app-toolbar',
  imports: [ErrorComponent],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class Toolbar {

  private readonly gameService = inject(GameService);
  private readonly errorService = inject(ErrorService);
  protected gameStarted = signal<boolean>(false);

  protected startGame() {
    if (!this.gameService.gameStarted) {
      this.gameService.player.set(new Player('Player 1', 'player1'));
      this.gameService.initStack();
      this.gameService.initHands();
      this.gameService.gameStarted = true;
      this.gameStarted.set(true);
      console.log("Game started");
    } else {
      this.errorService.addError("Game already started");
    }
  }

  protected joinGame() {
    console.log("Joining game");
    this.gameService.player.set(new Player('Player 2', 'player2'));
  }

  protected resetGame() {
    console.log("Proceeding Game reset");
    this.gameService.resetGame();
    this.gameStarted.set(false);
  }

  protected drawCard(player: 'player1' | 'player2') {
    this.gameService.drawCard(player, 1);
  }

  protected shufflePile() {
    this.gameService.shufflePile('player1');
    this.gameService.shufflePile('player2');
  }

}
