import { Component, effect, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Zone } from '../zone/zone';
import { CardComponent } from '../shared/components/card-component/card-component';
import { ZoneBrowserComponent } from '../shared/components/zone-browser/zone-browser';
import { Action } from '../shared/models/action';
import { Card } from '../shared/models/card';

@Component({
  selector: 'app-play-area',
  imports: [CardComponent, TranslatePipe, ZoneBrowserComponent],
  templateUrl: './play-area.html',
  styleUrl: './play-area.scss'
})
export class PlayArea extends Zone {

  protected cardIndexModifier = signal<number>(0)
  protected cardIndex: number = 0;
  protected actions = signal<Array<Action>>([Action.Discard]);
  protected card = signal<Card | undefined>(undefined);
  protected showBrowser = signal(false);

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
    this.card.set(this.cards()[this.cardIndex % this.cards().length]);
  }

  protected override discard(cardId: string) {
    this.gameService.discardAction(cardId);
  }

}
