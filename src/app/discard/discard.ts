import { Component } from '@angular/core';
import { Zone } from '../zone/zone';

@Component({
  selector: 'app-discard',
  imports: [],
  templateUrl: './discard.html',
  styleUrl: './discard.scss'
})
export class Discard extends Zone {
  
  constructor() {
    super();
    this.zoneName = 'discard';
  }

}
