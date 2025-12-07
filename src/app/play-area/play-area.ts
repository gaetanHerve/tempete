import { Component, effect, signal } from '@angular/core';
import { Zone } from '../zone/zone';
import { CardComponent } from '../shared/components/card-component/card-component';
import { Action } from '../shared/models/action';
import { Card } from '../shared/models/card';

@Component({
  selector: 'app-play-area',
  imports: [CardComponent],
  templateUrl: './play-area.html',
  styleUrl: './play-area.scss'
})
/**
 * Play area zone component for permanent cards in play.
 */
export class PlayArea extends Zone {

  protected cardIndexModifier = signal<number>(0)
  protected cardIndex: number = 0;
  protected actions = signal<Array<Action>>([Action.Discard]);
  protected card = signal<Card | undefined>(undefined);

  constructor() {
    super();
    this.zoneName.set('playArea');

    effect(() => {
      this.cardIndex = 0;
      if (this.cards().length > 1) {
        this.card.set(this.cards()[this.cards().length - 1]);
        this.actions.set([Action.Discard, Action.Previous, Action.Next]);
      } else {
        this.card.set(this.cards()[0]) ?? undefined;
        this.actions.set([Action.Discard]);
      }
    });
  }

  protected browse(dir: number) {
    this.cardIndex += dir;
    this.card.set(this.cards()[this.cardIndex%this.cards().length]);
  }


  protected override discard(cardId: string) {
    this.gameService.discardAction(cardId, false);
  }

}
