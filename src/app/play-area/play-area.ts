import { Component } from '@angular/core';
import { Zone } from '../zone/zone';
import { CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-play-area',
  imports: [CdkDropList],
  templateUrl: './play-area.html',
  styleUrl: './play-area.scss'
})
export class PlayArea extends Zone {
  constructor() {
    super();
    this.zoneName = 'playArea';
  }

  protected confirm(cardId: number) {
    this.gameService.moveToDiscard(cardId);
    this.gameService.drawCard();
  }

  protected takeBack(cardId: number) {
    this.gameService.moveToHand(cardId);
  }

  drop(event: any) {
    const card = event.item.data;
    if (event.previousContainer !== event.container) {
      this.gameService.moveToPlayArea(card.id);
    }
  }

}
