import { Component } from '@angular/core';
import { Zone } from '../zone/zone';
import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-play-area',
  imports: [CdkDrag, CdkDropList, CdkDropListGroup],
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

  drop(event: any) {
    const card = event.item.data;
    if (event.previousContainer !== event.container) {
      this.gameService.moveToPlayArea(card.id);
    }
  }

}
