import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Zone } from '../zone/zone';
import { ZoneBrowserComponent } from '../shared/components/zone-browser/zone-browser';

@Component({
  selector: 'app-stack',
  imports: [TranslatePipe, ZoneBrowserComponent],
  templateUrl: './stack.html',
  styleUrl: './stack.scss'
})
export class Stack extends Zone {

  protected showBrowser = signal(false);

  constructor() {
    super();
    this.zoneName.set('stack');
  }

}
