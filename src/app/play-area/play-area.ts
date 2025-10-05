import { Component } from '@angular/core';
import { Zone } from '../zone/zone';

@Component({
  selector: 'app-play-area',
  imports: [],
  templateUrl: './play-area.html',
  styleUrl: './play-area.scss'
})
export class PlayArea extends Zone {
  constructor() {
    super();
    this.zoneName = 'playArea';
  }

  protected confirm(cardId: string) {
    this.gameService.moveToDiscard(cardId);
    this.gameService.drawCard();
  }

  protected takeBack(cardId: string) {
    this.gameService.moveToHand(cardId);
  }

}
