import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Zone } from '../zone/zone';
import { CardComponent } from '../shared/components/card-component/card-component';

@Component({
  selector: 'app-discard',
  imports: [CardComponent, TranslatePipe],
  templateUrl: './discard.html',
  styleUrl: './discard.scss'
})
export class Discard extends Zone {
  
  constructor() {
    super();
    this.zoneName.set('discard');
  }

}
