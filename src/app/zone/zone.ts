import { Component, computed, inject, signal } from '@angular/core';
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
  protected cards = computed<Card[]>(() => {
    const zone = this.zoneName();
    if (!zone) return [];
    return this.gameService[zone]();
  });

  constructor() {}

  protected discard(cardId: string) {
    this.gameService.discardAction(cardId);
  }

  protected playCard(cardId: string, player: 'player1' | 'player2') {
    this.gameService.previewHandAction(cardId, player, 'play');
  }
  

}
