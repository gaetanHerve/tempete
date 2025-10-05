import { Component, inject } from '@angular/core';
import { GameService } from '../shared/services/game-service';
import { ErrorComponent } from '../shared/components/error-component/error-component';
import { ErrorService } from '../shared/services/error-service';

@Component({
  selector: 'app-toolbar',
  imports: [ErrorComponent],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class Toolbar {

  private readonly gameService = inject(GameService);
  private readonly errorService = inject(ErrorService);


  protected startGame() {
    if (!this.gameService.gameStarted) {
      this.gameService.initStack();
      this.gameService.initHand();
      this.gameService.gameStarted = true;
      console.log("Game started");
    } else {
      this.errorService.addError("Game already started");
    }
  }

  protected resetGame() {
    console.log("Proceeding Game reset");
    this.gameService.resetGame();
  }

  protected drawCard() {
    this.gameService.drawCard(1);
  }

}
