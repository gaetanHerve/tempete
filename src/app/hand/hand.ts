import { Component } from '@angular/core';
import { Zone } from '../zone/zone';
import {CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import { CardComponent } from "../shared/components/card-component/card-component";

@Component({
  selector: 'app-hand',
  imports: [CdkDrag, CdkDropList],
  templateUrl: './hand.html',
  styleUrl: './hand.scss'
})
export class Hand extends Zone {


  constructor() {
    super();
    this.zoneName = 'hand';
  }

  protected playCard(cardId: number) {
    this.gameService.moveToPlayArea(cardId);
  }

  protected discard(cardId: number) {
    this.gameService.discardAction(cardId);
  }

  drop(event: any) {
    console.log('previous', event.previousIndex, 'current', event.currentIndex);
    const card = event.item.data;
    // If card comes from another zone
    if (event.previousContainer !== event.container) {
      this.gameService.moveToHand(card.id);
    } else {
      // Reorganize in hand // TODO: fix that, not working properly
      moveItemInArray(this.gameService.hand(), event.previousIndex, event.currentIndex);
    }
  }
}
