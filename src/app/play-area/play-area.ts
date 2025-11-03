import { Component, effect, signal } from '@angular/core';
import { Zone } from '../zone/zone';
import { CardComponent } from '../shared/components/card-component/card-component';
import { Action } from '../shared/models/action';

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
  protected cardIndex = signal<number>(0);
  protected actions = [Action.Discard, Action.Previous, Action.Next];

  constructor() {
    super();
    this.zoneName = 'playArea';
    effect(() => {
      if (this.cards.length > 1) {
        this.cardIndex.set(this.cards.length - 1);
        // this.actions = [Action.Discard];
        // if (this.cardIndex() < this.cards.length - 1) this.actions.push(Action.Next);
        // if (this.cardIndex() > 0) this.actions.push(Action.Previous);
      }
    });
  }

  protected browse(dir: number) {
    console.log('in browse')
    const newIndex = this.cardIndex() + dir;
    // if (newIndex >= 0 && newIndex < this.cards.length) {
      this.cardIndex.set(newIndex%this.cards.length);
      console.log('new cardIndexModifier', this.cardIndex());
    // }
  }

}
