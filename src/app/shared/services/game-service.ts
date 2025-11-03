import { inject, Injectable, signal } from '@angular/core';
import { Card } from '../models/card';
import { ErrorService } from './error-service';
import cardListData from '../card-list.json';


export interface Pile {
  cards: Card[];
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly errorService = inject(ErrorService);

  stack = signal<Card[]>([]);
  playArea = signal<Card[]>([]);
  discard = signal<Card[]>([]);
  hand = signal<Card[]>([]);

  public cardsPerHand = 5;
  public gameStarted = false;

  // TODO: store the cards in local storage to persist between sessions

  initStack() {
    // Initialize the stack with a standard set of cards
    let allCards: Card[] = this.createCardsFromJson();
    this.stack.set(allCards);
    this.shufflePile('stack');
  }

  shufflePile(zone: 'stack' | 'playArea' | 'discard' | 'hand') {
    let shuffled = zone === 'stack' ? this.stack() :
                   zone === 'playArea' ? this.playArea() :
                   zone === 'discard' ? this.discard() :
                   this.hand();
    if (shuffled.length <= 1) return;
    else this[zone].set(this.shuffleArray(shuffled));
  }

  initHand()  {
    for (let i = 0; i < this.cardsPerHand; i++) {
      this.drawCard();
    }
  }

  playCard(cardId: number) {
    const card: Card = this.getPile('hand').find(c => c.id === cardId)!;
    if (!card) {
      this.errorService.addError('Card not found in hand.');
      return;
    }
    if (card.permanent) {
      this.moveToPlayArea(cardId);
    } else {
      this.moveToDiscard(cardId);
    }
    this.drawCard();
  }

  drawCard(numberOfCards: number = 1) {
    for (let i = 0; i < numberOfCards; i++) {

      if (this.stack().length === 0) {
        if (this.discard().length > 0) {
          // Mélange la défausse dans la pile stack
          this.stack.set(this.shuffleArray(this.discard()));
          this.discard.set([]);
        } else {
          this.errorService.addError('Stack and discard are empty, cannot draw more cards.');
          return;
        }
      }
      if (this.hand().length >= this.cardsPerHand) {
        this.errorService.addError('Hand is full, cannot draw more cards.');
        return;
      }
      // setTimeout(() => {
        // add timeout for UX
        this.moveToHand(this.stack()[0].id);
      // }, 250);
    }
  }

  discardAction(cardId: number, drawCard = true) {
    this.moveToDiscard(cardId);
    if (drawCard) this.drawCard();
  }

  addToStack(card: Card) {
    this.stack.update(pile => [...pile, card]);
  }

  moveToPlayArea(cardId: number) {
    let card = this.removeCardFromAnyPile(cardId);
    if (card) {
      this.playArea.update(pile => [...pile, card]);
    }
  }

  moveToDiscard(cardId: number) {
    let card = this.removeCardFromAnyPile(cardId);
    if (card) {
      this.discard.update(pile => [...pile, card]);
    }
  }

  moveToHand(cardId: number) {
    let card = this.removeCardFromAnyPile(cardId);
    if (card) {
      this.hand.update(pile => [...pile, card]);
    }
  }

  removeCardFromAnyPile(cardId: number): Card | undefined {
    const piles = [this.stack, this.playArea, this.discard, this.hand];
    for (const pileSignal of piles) {
      const pile = pileSignal();
      const idx = pile.findIndex(c => c.id === cardId);
      if (idx !== -1) {
        const card = pile[idx];
        const newCards = [...pile.slice(0, idx), ...pile.slice(idx + 1)];
        pileSignal.update(() => newCards );
        return card;
      }
    }
    return undefined;
  }

  getPile(zone: 'stack' | 'playArea' | 'discard' | 'hand'): Card[] {
    return this[zone]();
  }

  resetGame() {
    this.stack.set([]);
    this.playArea.set([]);
    this.discard.set([]);
    this.hand.set([]);
    this.gameStarted = false;
  }

  // Utils
  private shuffleArray(array: Card[]): Card[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private createCardsFromJson(): Card[] {
    const cards: Card[] = [];
    const cardList = cardListData.cardList;
    Object.entries(cardList).forEach(([key, value]: [string, any], index) => {
      cards.push(new Card(
        index,
        value.title ?? key,
        value.description ?? '',
        value.moment ?? '',
        value.permanent ?? false,
        value.imageUrl ?? `assets/cards/card-default.jpg`
      ));
    });
    return cards;
  }

}
