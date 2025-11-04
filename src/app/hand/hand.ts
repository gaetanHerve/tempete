import { Component, effect, input } from '@angular/core';
import { Zone } from '../zone/zone';
import { CardComponent } from "../shared/components/card-component/card-component";
import { Action } from '../shared/models/action';

@Component({
  selector: 'app-hand',
  imports: [CardComponent],
  templateUrl: './hand.html',
  styleUrl: './hand.scss'
})
export class Hand extends Zone {

  public player = input<'player1' | 'player2'>()
  protected actions = [Action.Play, Action.Discard]

  constructor() {
    super();
    effect(() => this.zoneName.set(this.player()))
  }

}
