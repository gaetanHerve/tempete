import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Zone } from '../zone/zone';
import { CardComponent } from '../shared/components/card-component/card-component';
import { ZoneBrowserComponent } from '../shared/components/zone-browser/zone-browser';

@Component({
  selector: 'app-discard',
  imports: [CardComponent, TranslatePipe, ZoneBrowserComponent],
  templateUrl: './discard.html',
  styleUrl: './discard.scss'
})
export class Discard extends Zone {

  protected showBrowser = signal(false);

  constructor() {
    super();
    this.zoneName.set('discard');
  }

}
