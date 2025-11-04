import { Component, effect, inject, signal } from '@angular/core';
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

  protected zoneName = signal<'stack' | 'playArea' | 'discard' | 'player1' | 'player2' | undefined>(undefined);
  protected cards = signal<Card[]>([]);

  constructor() {
    effect(() => {
      if (this.zoneName != undefined) {
        if (this.zoneName()) {
          this.cards.set(this.gameService[this.zoneName()!]());
        }
        
      }
    });
  }

  protected discard(cardId: number) {
    this.gameService.discardAction(cardId);
  }

  protected playCard(cardId: number, player: 'player1' | 'player2') {
    this.gameService.playCard(cardId, player);
  }
  

}
