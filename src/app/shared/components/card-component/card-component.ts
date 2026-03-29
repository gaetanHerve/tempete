import { Component, input, output, signal } from '@angular/core';
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
  readonly play = output<string>();
  readonly discard = output<string>();
  readonly browse = output<number>();
  private defaultImage = 'assets/cards/default.png';

  protected expanded = signal(false);

  protected toggleExpanded() {
    this.expanded.update(v => !v);
  }

  protected closeExpanded() {
    this.expanded.set(false);
  }

  protected onPlay(id: string) {
    this.play.emit(id);
  }

  protected onDiscard(id: string) {
    this.discard.emit(id);    
  }

  onBrowse(dir: number) {
    this.browse.emit(dir);
  }

  getImageSrc(): string {
    const imgName = this.card()?.imageUrl;
    // guard: an empty/undefined image name would yield 'assets/cards/undefined' -> 404
    return imgName ? `assets/cards/${imgName}` : this.defaultImage;
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && img.src.indexOf(this.defaultImage) === -1) {
      img.src = this.defaultImage;
    }
  }

}
