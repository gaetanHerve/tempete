import { effect, inject, Injectable, signal } from '@angular/core';
import { Card } from '../models/card';
import { ErrorService } from './error-service';
import cardListData from '../card-list.json';
import { Game } from '../models/game';
import { GameSocketService } from './gameSocket-service';
import { Player } from '../models/player';


export interface Pile {
  cards: Card[];
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly errorService = inject(ErrorService);
  // private readonly gameAPI = inject(GameAPIService);
  

  player = signal<Player>(new Player('Player 1', 'player1'));
  gameSocketService: GameSocketService | undefined;
  isConnected!: ReturnType<typeof signal>;
  error!: ReturnType<typeof signal>;
  stack = signal<Card[]>([]);
  playArea = signal<Card[]>([]);
  discard = signal<Card[]>([]);
  player1 = signal<Card[]>([]);
  player2 = signal<Card[]>([]);

  public cardsPerHand = 5;
  public gameStarted = false;


  constructor() {
    effect(() => {
      if (this.player()) {
        this.gameSocketService = new GameSocketService(this.player());
        this.isConnected = signal(false);
        this.error = signal<Error | undefined>(undefined);

        // Connect to socket
        this.gameSocketService.onConnect().subscribe({
          next: () => {
            this.isConnected.set(true);
          },
          error: () => {
            this.isConnected.set(false);
          }
        });

        // Listen for errors
        this.gameSocketService.onError().subscribe({
          next: (err) => {
            this.error.set(err);
          }
        });

        // Listen for incoming game state from opponent
        this.gameSocketService.onNewGame().subscribe({
          next: (game) => {
            this.stack.set(game.stack ?? []);
            this.playArea.set(game.playArea ?? []);
            this.discard.set(game.discard ?? []);
            this.player1.set(game.player1Hand ?? []);
            this.player2.set(game.player2Hand ?? []);
            this.gameStarted = true;
          }
        });
      }
    });
  }
  // TODO: store the cards in local storage to persist between sessions?

  initStack() {
    // Initialize the stack with a standard set of cards
    let allCards: Card[] = this.createCardsFromJson();
    this.stack.set(allCards);
    this.shufflePile('stack');
  }

  shufflePile(zone: 'stack' | 'playArea' | 'discard' | 'player1' | 'player2') {
    let shuffled = zone === 'stack' ? this.stack() :
                   zone === 'playArea' ? this.playArea() :
                   zone === 'discard' ? this.discard() :
                   zone === 'player1' ? this.player1() :
                   this.player2();
    if (shuffled.length <= 1) return;
    else this[zone].set(this.shuffleArray(shuffled));

    const id = crypto.randomUUID();
    const newGame: Game = {
      _id: id,
      player1: 'player1',
      player2: 'player2',
      player1Hand: this.player1(),
      player2Hand: this.player2(),
      playArea: this.playArea(),
      discard: this.discard(),
      stack: this.stack()
    }


    if (this.gameSocketService) {
      this.gameSocketService.sendMessage(newGame);
    }
    // TODO: return invitation link

  }

  initHands()  {
    for (let i = 0; i < this.cardsPerHand; i++) {
      this.drawCard('player1');
      this.drawCard('player2');
    }
  }

  playCard(cardId: string, player: 'player1' | 'player2') {
    const card: Card = this.getPile(player).find(c => c._id === cardId)!;
    if (!card) {
      this.errorService.addError('Card not found in hand.');
      return;
    }
    if (card.permanent) {
      this.moveToPlayArea(cardId);
    } else {
      this.moveToDiscard(cardId);
    }
    this.drawCard(player);
  }

  drawCard(player: 'player1' | 'player2', numberOfCards: number = 1) {
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
      const hand = player === 'player1' ? this.player1() : this.player2();
      if (hand.length >= this.cardsPerHand) {
        this.errorService.addError('Hand is full, cannot draw more cards.');
        return;
      }
      this.moveToHand(this.stack()[0]._id, player);
    }
  }

  discardAction(cardId: string, drawCard = true, player?: 'player1' | 'player2') {
    this.moveToDiscard(cardId);
    if (drawCard && player) this.drawCard(player);
  }

  addToStack(card: Card) {
    this.stack.update(pile => [...pile, card]);
  }

  moveToPlayArea(cardId: string) {
    let card = this.removeCardFromAnyPile(cardId);
    if (card) {
      this.playArea.update(pile => [...pile, card]);
    }
  }

  moveToDiscard(cardId: string) {
    let card = this.removeCardFromAnyPile(cardId);
    if (card) {
      this.discard.update(pile => [...pile, card]);
    }
  }

  moveToHand(cardId: string, player: 'player1' | 'player2') {
    let card = this.removeCardFromAnyPile(cardId);
    if (card) {
      player === 'player1'
        ? this.player1.update(pile => [...pile, card])
        : this.player2.update(pile => [...pile, card]);
    }
  }

  removeCardFromAnyPile(cardId: string): Card | undefined {
    const piles = [this.stack, this.playArea, this.discard, this.player1, this.player2];
    for (const pileSignal of piles) {
      const pile = pileSignal();
      const idx = pile.findIndex(c => c._id === cardId);
      if (idx !== -1) {
        const card = pile[idx];
        const newCards = [...pile.slice(0, idx), ...pile.slice(idx + 1)];
        pileSignal.update(() => newCards );
        return card;
      }
    }
    return undefined;
  }

  getPile(zone: 'stack' | 'playArea' | 'discard' | 'player1' | 'player2'): Card[] {
    return this[zone]();
  }

  resetGame() {
    this.stack.set([]);
    this.playArea.set([]);
    this.discard.set([]);
    this.player1.set([]);
    this.player2.set([]);
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
    Object.entries(cardList).forEach(([key, value]: [string, any]) => {
      cards.push(new Card(
        key,
        value.title ?? key,
        value.description ?? '',
        value.moment ?? '',
        value.permanent ?? false,
        `${key}.png`
      ));
    });
    return cards;
  }

}
