import { Component, effect, inject } from '@angular/core';
import { GameService } from '../shared/services/game-service';
import { Card } from '../shared/models/card';

@Component({
  selector: 'app-zone',
  imports: [],
  templateUrl: './zone.html',
  styleUrl: './zone.scss'
})
export class Zone {

  protected readonly gameService = inject(GameService);

  protected zoneName: 'stack' | 'playArea' | 'discard' | 'hand' | undefined = undefined;
  protected cards: Card[] = [];
  protected nbCards: number = 0;

  constructor() {
    effect(() => {
      if (this.zoneName != undefined) {
        this.cards = this.gameService[this.zoneName]();
        this.nbCards = this.cards.length;
      }
    });
  }

  protected discard(cardId: number) {
    this.gameService.discardAction(cardId);
  }

  protected playCard(cardId: number) {
    this.gameService.playCard(cardId);
  }
  

}
