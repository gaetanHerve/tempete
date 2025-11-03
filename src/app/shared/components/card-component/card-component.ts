import { Component, input, output } from '@angular/core';
import { Card } from '../../models/card';
import { Action } from '../../models/action';

@Component({
  selector: 'app-card-component',
  imports: [],
  templateUrl: './card-component.html',
  styleUrl: './card-component.scss'
})
export class CardComponent {

  public readonly card = input.required<Card>();
  public readonly actions = input<Action[]>();
  public readonly action = Action;
  readonly play = output<number>();
  readonly discard = output<number>();
  readonly browse = output<number>();

  protected onPlay(id: number) {
    this.play.emit(id);
  }

  protected onDiscard(id: number) {
    this.discard.emit(id);    
  }

  onBrowse(dir: number) {
    this.browse.emit(dir);
  }

}
