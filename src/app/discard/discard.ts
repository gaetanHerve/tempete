import { Component } from '@angular/core';
import { Zone } from '../zone/zone';
import { CardComponent } from '../shared/components/card-component/card-component';

@Component({
  selector: 'app-discard',
  imports: [CardComponent],
  templateUrl: './discard.html',
  styleUrl: './discard.scss'
})
export class Discard extends Zone {
  
  constructor() {
    super();
    this.zoneName = 'discard';
  }

}
