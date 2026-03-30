import { inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs/operators';
import { Card } from '../models/card';
import { ErrorService } from './error-service';
import cardListData from '../card-list.json';
import { Game } from '../models/game';
import { GameSocketService } from './gameSocket-service';
import { Player } from '../models/player';
import { TranslateService } from '@ngx-translate/core';


export interface Pile {
  cards: Card[];
}

interface GameSnapshot {
  stack: Card[];
  playArea: Card[];
  discard: Card[];
  player1: Card[];
  player2: Card[];
  player1PlayedThisTurn: boolean;
  player2PlayedThisTurn: boolean;
}

interface PendingAction {
  player: 'player1' | 'player2';
  snapshot: GameSnapshot; // état AVANT le preview, pour pouvoir annuler
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly errorService = inject(ErrorService);
  private readonly gameSocketService = inject(GameSocketService);
  private readonly translate = inject(TranslateService);

  player = signal<Player>(new Player('Player 1', 'player1', 'white'));
  roomCode = signal<string | null>(null);
  player1Color = signal<'white' | 'black'>('white');
  isConnected = signal<boolean>(false);
  stack = signal<Card[]>([]);
  playArea = signal<Card[]>([]);
  discard = signal<Card[]>([]);
  player1 = signal<Card[]>([]);
  player2 = signal<Card[]>([]);
  currentTurn = signal<'player1' | 'player2'>('player1');
  player1PlayedThisTurn = signal<boolean>(false);
  player2PlayedThisTurn = signal<boolean>(false);
  pendingAction = signal<PendingAction | null>(null);

  public cardsPerHand = 5;
  public gameStarted = false;

  constructor() {
    this.gameSocketService.onConnect().subscribe(() => this.isConnected.set(true));
    this.gameSocketService.onDisconnect().subscribe(() => this.isConnected.set(false));

    this.gameSocketService.onJoinError().subscribe(({ message }) => {
      this.errorService.addError(message);
    });

    this.gameSocketService.onGameState().subscribe((game) => {
      console.log('[onGameState] received game state | player:', this.player().number, '| stack:', game.stack?.length, '| p1hand:', game.player1Hand?.length, '| p2hand:', game.player2Hand?.length);
      this.stack.set(game.stack ?? []);
      this.playArea.set(game.playArea ?? []);
      this.discard.set(game.discard ?? []);
      this.player1.set(game.player1Hand ?? []);
      this.player2.set(game.player2Hand ?? []);
      this.currentTurn.set(game.currentTurn ?? 'player1');
      this.player1PlayedThisTurn.set(game.player1PlayedThisTurn ?? false);
      this.player2PlayedThisTurn.set(game.player2PlayedThisTurn ?? false);
      if (game.player1Color) {
        this.player1Color.set(game.player1Color);
        const myNumber = this.player().number;
        const myColor = myNumber === 'player1' ? game.player1Color : (game.player1Color === 'white' ? 'black' : 'white');
        this.player.update(p => new Player(p.name, p.number, myColor));
      }
      this.gameStarted = true;
    });
  }

  createGame(color: 'white' | 'black', onSuccess?: () => void): void {
    this.gameSocketService.createGame().subscribe(({ roomCode, playerNumber }) => {
      this.roomCode.set(roomCode);
      this.player1Color.set(color);
      this.player.set(new Player('Player 1', playerNumber, color));
      if (color === 'black') {
        this.currentTurn.set('player2');
      }
      this.initStack();
      this.initHands();
      this.gameStarted = true;
      onSuccess?.();

      this.gameSocketService.onOpponentJoined().pipe(take(1)).subscribe(() => {
        this.syncGameState();
      });
    });
  }

  joinGame(roomCode: string): void {
    this.gameSocketService.joinGame(roomCode).subscribe(({ roomCode: code, playerNumber }) => {
      this.roomCode.set(code);
      this.player.set(new Player('Player 2', playerNumber));
    });
  }

  endTurn(): void {
    this.currentTurn.set(this.currentTurn() === 'player1' ? 'player2' : 'player1');
    this.player1PlayedThisTurn.set(false);
    this.player2PlayedThisTurn.set(false);
    this.syncGameState();
  }

  // --- Actions de la main avec confirmation ---

  /**
   * Phase 1 : déplace la carte localement sans piocher ni synchroniser.
   * L'adversaire ne voit rien tant que le joueur n'a pas confirmé.
   */
  previewHandAction(cardId: string, player: 'player1' | 'player2', type: 'play' | 'discard'): void {
    if (this.pendingAction()) return;

    const alreadyPlayed = player === 'player1' ? this.player1PlayedThisTurn() : this.player2PlayedThisTurn();
    if (alreadyPlayed) {
      this.errorService.addError(this.translate.instant('errors.already_played'));
      return;
    }

    const snapshot = this.takeSnapshot();

    if (type === 'play') {
      const card = this.getPile(player).find(c => c._id === cardId);
      if (!card) {
        this.errorService.addError(this.translate.instant('errors.card_not_found'));
        return;
      }
      if (card.permanent) {
        this.moveToPlayArea(cardId);
      } else {
        this.moveToDiscard(cardId);
      }
    } else {
      this.moveToDiscard(cardId);
    }

    this.pendingAction.set({ player, snapshot });
  }

  /**
   * Phase 2a : confirme l'action → pioche, marque le tour, synchronise.
   */
  confirmPendingAction(): void {
    const pending = this.pendingAction();
    if (!pending) return;

    const { player } = pending;

    this.drawCard(player);

    if (player === 'player1') this.player1PlayedThisTurn.set(true);
    else this.player2PlayedThisTurn.set(true);

    this.pendingAction.set(null);
    this.syncGameState();
  }

  /**
   * Phase 2b : annule l'action → restaure silencieusement l'état local, sans sync.
   */
  cancelPendingAction(): void {
    const pending = this.pendingAction();
    if (!pending) return;
    this.restoreSnapshot(pending.snapshot);
    this.pendingAction.set(null);
  }

  // --- Défausse depuis la zone de jeu (sans pioche, sans confirmation) ---

  discardAction(cardId: string): void {
    this.moveToDiscard(cardId);
    this.syncGameState();
  }

  // --- Initialisation ---

  initStack() {
    const allCards: Card[] = this.createCardsFromJson();
    this.stack.set(allCards);
    this.shufflePile('stack');
  }

  initHands() {
    for (let i = 0; i < this.cardsPerHand; i++) {
      this.drawCard('player1');
      this.drawCard('player2');
    }
  }

  shufflePile(zone: 'stack' | 'playArea' | 'discard' | 'player1' | 'player2') {
    const pile = zone === 'stack' ? this.stack() :
                 zone === 'playArea' ? this.playArea() :
                 zone === 'discard' ? this.discard() :
                 zone === 'player1' ? this.player1() :
                 this.player2();
    if (pile.length <= 1) return;
    this[zone].set(this.shuffleArray(pile));
    this.syncGameState();
  }

  drawCard(player: 'player1' | 'player2', numberOfCards: number = 1) {
    for (let i = 0; i < numberOfCards; i++) {
      if (this.stack().length === 0) {
        if (this.discard().length > 0) {
          this.stack.set(this.shuffleArray(this.discard()));
          this.discard.set([]);
        } else {
          this.errorService.addError(this.translate.instant('errors.stack_empty'));
          return;
        }
      }
      const hand = player === 'player1' ? this.player1() : this.player2();
      if (hand.length >= this.cardsPerHand) {
        this.errorService.addError(this.translate.instant('errors.hand_full'));
        return;
      }
      this.moveToHand(this.stack()[0]._id, player);
    }
  }

  addToStack(card: Card) {
    this.stack.update(pile => [...pile, card]);
  }

  moveToPlayArea(cardId: string) {
    const card = this.removeCardFromAnyPile(cardId);
    if (card) this.playArea.update(pile => [...pile, card]);
  }

  moveToDiscard(cardId: string) {
    const card = this.removeCardFromAnyPile(cardId);
    if (card) this.discard.update(pile => [...pile, card]);
  }

  moveToHand(cardId: string, player: 'player1' | 'player2') {
    const card = this.removeCardFromAnyPile(cardId);
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
        pileSignal.update(() => [...pile.slice(0, idx), ...pile.slice(idx + 1)]);
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
    this.roomCode.set(null);
    this.currentTurn.set('player1');
    this.player1PlayedThisTurn.set(false);
    this.player2PlayedThisTurn.set(false);
    this.pendingAction.set(null);
    this.player1Color.set('white');
    this.player.set(new Player('Player 1', 'player1', 'white'));
    this.gameStarted = false;
  }

  // --- Snapshot helpers ---

  private takeSnapshot(): GameSnapshot {
    return {
      stack: [...this.stack()],
      playArea: [...this.playArea()],
      discard: [...this.discard()],
      player1: [...this.player1()],
      player2: [...this.player2()],
      player1PlayedThisTurn: this.player1PlayedThisTurn(),
      player2PlayedThisTurn: this.player2PlayedThisTurn()
    };
  }

  private restoreSnapshot(snapshot: GameSnapshot): void {
    this.stack.set(snapshot.stack);
    this.playArea.set(snapshot.playArea);
    this.discard.set(snapshot.discard);
    this.player1.set(snapshot.player1);
    this.player2.set(snapshot.player2);
    this.player1PlayedThisTurn.set(snapshot.player1PlayedThisTurn);
    this.player2PlayedThisTurn.set(snapshot.player2PlayedThisTurn);
  }

  // --- Sync & utils ---

  private syncGameState(): void {
    const code = this.roomCode();
    console.log('[syncGameState] roomCode:', code, '| player:', this.player().number);
    if (!code) return;

    const game: Game = {
      _id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      player1: 'player1',
      player2: 'player2',
      player1Hand: this.player1(),
      player2Hand: this.player2(),
      playArea: this.playArea(),
      discard: this.discard(),
      stack: this.stack(),
      currentTurn: this.currentTurn(),
      player1PlayedThisTurn: this.player1PlayedThisTurn(),
      player2PlayedThisTurn: this.player2PlayedThisTurn(),
      player1Color: this.player1Color()
    };
    this.gameSocketService.sendGameState(code, game);
  }

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
