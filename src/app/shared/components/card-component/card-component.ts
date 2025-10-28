import { Component, input } from '@angular/core';
import { Card } from '../../models/card';

@Component({
  selector: 'app-card-component',
  imports: [],
  templateUrl: './card-component.html',
  styleUrl: './card-component.scss'
})
export class CardComponent {

  // TODO: use that in zones
  public readonly card = input<Card>();

}
