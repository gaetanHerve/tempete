import { Component } from '@angular/core';
import { Zone } from '../zone/zone';
import { CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-discard',
  imports: [CdkDropList],
  templateUrl: './discard.html',
  styleUrl: './discard.scss'
})
export class Discard extends Zone {
  
  constructor() {
    super();
    this.zoneName = 'discard';
  }

  drop(event: any) {
    const card = event.item.data;
    if (event.previousContainer !== event.container) {
      this.gameService.discardAction(card.id);

    }
  }

}
