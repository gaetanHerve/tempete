import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  private readonly translate = inject(TranslateService);

  readonly currentLang = signal<string>('fr');

  constructor() {
    const saved = localStorage.getItem('lang') ?? 'fr';
    this.translate.use(saved);
    this.currentLang.set(saved);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);
  }

}
