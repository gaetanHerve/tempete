import { Component } from '@angular/core';
import { Zone } from '../zone/zone';

@Component({
  selector: 'app-stack',
  imports: [],
  templateUrl: './stack.html',
  styleUrl: './stack.scss'
})
export class Stack extends Zone {

  constructor() {
    super();
    this.zoneName.set('stack');
  }

}
