import { Component, effect, inject } from '@angular/core';
import { Toolbar } from "../toolbar/toolbar";
import { Hand } from '../hand/hand';
import { Stack } from '../stack/stack';
import { Discard } from '../discard/discard';
import { PlayArea } from '../play-area/play-area';
import { GameService } from '../shared/services/game-service';

@Component({
  selector: 'app-board',
  imports: [Toolbar, Hand, Stack, Discard, PlayArea],
  templateUrl: './board.html',
  styleUrl: './board.scss'
})
export class Board {

  private readonly gameService = inject(GameService);
  protected player: 'player1' | 'player2' = 'player1';
  constructor() {
    effect(() => {
      this.player = this.gameService.player().number;
    });
  }

}
