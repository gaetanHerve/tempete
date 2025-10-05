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

  constructor() {
    effect(() => {
      console.log(`The ${this.zoneName} is composed of ${this.gameService.stack().length} cards`);
      if (this.zoneName != undefined) this.cards = this.gameService[this.zoneName]();
    });
  }

}
