import { Injectable, signal } from '@angular/core';
import { Card } from '../models/card';
import { CardTitle } from '../models/cardTitle';

export interface Pile {
  cards: Card[];
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  stack = signal<Card[]>([]);
  playArea = signal<Card[]>([]);
  discard = signal<Card[]>([]);
  hand = signal<Card[]>([]);

  public cardsPerHand = 5;
  public gameStarted = false;

  // TODO: store the cards in local storage to persist between sessions

  initStack() {
    // Initialize the stack with a standard set of cards
    const allCards: Card[] = [];
    Object.keys(CardTitle).forEach((key, index) => {
      const title = CardTitle[key as keyof typeof CardTitle];
      allCards.push(new Card(`${index}`, title, `Content for ${title}`, `assets/images/${title}.png`, `https://example.com/${title}`));
    });
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
      if (this.stack().length === 0) {
        if (this.discard().length > 0) {
          // Mélange la défausse dans la pile stack
          this.stack.set(this.shuffleArray(this.discard()));
          this.discard.set([]);
          console.log('Reshuffled discard into stack.');
        } else {
          console.log('Stack and discard are empty, cannot draw more cards.');
          return;
        }
      }
      this.drawCard();
    }
  }

  drawCard(numberOfCards: number = 1) {
    for (let i = 0; i < numberOfCards; i++) {
      if (this.stack().length === 0) {
        console.log('Stack is empty, cannot draw more cards.');
        return;
      }
      this.moveToHand(this.stack()[0].id);
    }
  }

  addToStack(card: Card) {
    this.stack.update(pile => [...pile, card]);
  }

  moveToPlayArea(cardId: string) {
    const stackPile = this.stack();
    const idx = stackPile.findIndex(c => c.id === cardId);
    if (idx !== -1) {
      const card = stackPile[idx];
      const newStack = [...stackPile.slice(0, idx), ...stackPile.slice(idx + 1)];
      this.stack.update(() => (newStack));
      this.playArea.update(pile => [...pile, card]);
    }
  }

  moveToDiscard(cardId: string) {
    let card = this.removeCardFromAnyPile(cardId);
    if (card) {
      this.discard.update(pile => [...pile, card]);
    }
  }

  moveToHand(cardId: string) {
    let card = this.removeCardFromAnyPile(cardId);
    // console.log('cardToMove', card)

    if (card) {
      this.hand.update(pile => [...pile, card]);
    }
  }

  removeCardFromAnyPile(cardId: string): Card | undefined {
    // console.log('removing card from any pile:', cardId);
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
}
