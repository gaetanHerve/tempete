import { Injectable, signal } from '@angular/core';

const GOD_MODE_PASSWORD = 'TEMPETE';

@Injectable({
  providedIn: 'root'
})
export class GodModeService {

  readonly enabled = signal(false);

  unlock(password: string): boolean {
    if (password.trim().toUpperCase() === GOD_MODE_PASSWORD) {
      this.enabled.set(true);
      return true;
    }
    return false;
  }

  disable(): void {
    this.enabled.set(false);
  }

}
