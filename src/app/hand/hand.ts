import { Component } from '@angular/core';
import { Zone } from '../zone/zone';

@Component({
  selector: 'app-hand',
  imports: [],
  templateUrl: './hand.html',
  styleUrl: './hand.scss'
})
export class Hand extends Zone {


  constructor() {
    super();
    this.zoneName = 'hand';
  }

  protected playCard(cardId: string) {
    this.gameService.moveToPlayArea(cardId);
  }

  protected discard(cardId: string) {
    this.gameService.moveToDiscard(cardId);
    this.gameService.drawCard();
  }
}
