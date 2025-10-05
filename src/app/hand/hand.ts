import { Component } from '@angular/core';
import { Zone } from '../zone/zone';

@Component({
  selector: 'app-hand',
  imports: [],
  templateUrl: './hand.html',
  styleUrl: './hand.scss'
})
export class Hand extends Zone {


  constructor() {
    super();
    this.zoneName = 'hand';
  }
}
