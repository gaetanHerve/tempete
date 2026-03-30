import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '../../models/card';
import { Action } from '../../models/action';
import { GameService } from '../../services/game-service';
import { GodModeService } from '../../services/god-mode-service';
import { CardComponent } from '../card-component/card-component';

@Component({
  selector: 'app-zone-browser',
  imports: [CardComponent, TranslatePipe, FormsModule],
  templateUrl: './zone-browser.html',
  styleUrl: './zone-browser.scss'
})
export class ZoneBrowserComponent {

  readonly cards = input.required<Card[]>();
  readonly zoneKey = input.required<string>();

  readonly closed = output<void>();

  protected readonly godModeService = inject(GodModeService);
  private readonly gameService = inject(GameService);

  protected readonly godModeActions: Action[] = [Action.Play, Action.Discard];

  protected showPasswordInput = signal(false);
  protected passwordInput = '';
  protected wrongPassword = signal(false);

  protected tryUnlock(): void {
    const success = this.godModeService.unlock(this.passwordInput);
    if (success) {
      this.showPasswordInput.set(false);
      this.passwordInput = '';
      this.wrongPassword.set(false);
    } else {
      this.wrongPassword.set(true);
    }
  }

  protected onPlay(cardId: string): void {
    this.gameService.godModeAction(cardId, 'play');
  }

  protected onDiscard(cardId: string): void {
    this.gameService.godModeAction(cardId, 'discard');
  }

}
