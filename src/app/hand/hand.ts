import { Component, effect, input } from '@angular/core';
import { Zone } from '../zone/zone';
import { CardComponent } from "../shared/components/card-component/card-component";
import { Action } from '../shared/models/action';
import { Card } from '../shared/models/card';
import { getMomentCategory, MomentCategory } from '../shared/models/moment-category';

@Component({
  selector: 'app-hand',
  imports: [CardComponent],
  templateUrl: './hand.html',
  styleUrl: './hand.scss'
})
export class Hand extends Zone {

  public player = input<'player1' | 'player2'>()

  protected actionsFor(card: Card): Action[] {
    if (this.gameService.pendingAction()) return [];

    const player = this.player();
    const currentTurn = this.gameService.currentTurn();
    const alreadyPlayed = player === 'player1'
      ? this.gameService.player1PlayedThisTurn()
      : this.gameService.player2PlayedThisTurn();

    if (alreadyPlayed) return [];

    const isOwnTurn = currentTurn === player;
    const category = getMomentCategory(card.moment);

    const canPlay =
      category === MomentCategory.ANY_TIME ||
      (category === MomentCategory.OWN_TURN && isOwnTurn) ||
      (category === MomentCategory.OPPONENT_TURN && !isOwnTurn);

    const actions: Action[] = [];
    if (canPlay) actions.push(Action.Play);
    if (isOwnTurn) actions.push(Action.Discard);
    return actions;
  }

  constructor() {
    super();
    effect(() => this.zoneName.set(this.player()))
  }

  protected override playCard(cardId: string, player: 'player1' | 'player2') {
    this.gameService.previewHandAction(cardId, player, 'play');
  }

  protected override discard(cardId: string) {
    this.gameService.previewHandAction(cardId, this.player()!, 'discard');
  }

}
