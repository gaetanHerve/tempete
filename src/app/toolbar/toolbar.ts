import { Component, inject } from '@angular/core';
import { GameService } from '../shared/services/game-service';

@Component({
  selector: 'app-toolbar',
  imports: [],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class Toolbar {

  private readonly gameService = inject(GameService);


  protected startGame() {
    if (!this.gameService.gameStarted) {
      this.gameService.initStack();
      this.gameService.initHand();
      this.gameService.gameStarted = true;
      console.log("Game started");
      console.log('cards in hand', this.gameService.hand());
    } else {
      console.log("Game already started");
    }
  }

  protected resetGame() {
    console.log("Proceeding Game reset");
    this.gameService.resetGame();
  }

  protected drawCard() {
    this.gameService.drawCard(1);
    console.log('nb cards in hand', this.gameService.hand().length);
    console.log('nb cards in stack', this.gameService.stack().length);
  }

}
