import { Injectable, signal } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable, fromEvent, Subject } from 'rxjs';
import { Game } from '../models/game';
import { Player } from '../models/player';
import { socket_URL } from '../../env.json';

@Injectable({
  providedIn: 'root'
})
export class GameSocketService {
  private socketPlayer1: Socket;
  private socketPlayer2: Socket;
  private opponentSocket: Socket; 
  protected player = signal<Player>(new Player('Player 1', 'player1'));
  // Signal pour gérer l'état de la liste des utilisateurs
  private gameSignal = signal<Game[]>([]);
  public games = this.gameSignal.asReadonly();
  // Subject pour distribuer les messages entrants aux composants
  private messageSubject = new Subject<any>();
  public messages$ = this.messageSubject.asObservable();

  constructor(player: Player) {
    // Initialise la connexion WebSocket avec des paramètres de reconnexion automatique
    // pour assurer une connexion robuste en cas de perte de connexion
    this.player.set(player);
    this.socketPlayer1 = io(socket_URL.player1, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

    this.socketPlayer2 = io(socket_URL.player2, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.opponentSocket = player.number === 'player1' ? this.socketPlayer2 : this.socketPlayer1;
    // Souscription aux nouveaux utilisateurs directement dans le service
    this.onNewUser().subscribe((game: Game) => {
      this.gameSignal.update(games => [...games, game]);
    });

    // Réémettre les événements génériques 'message' vers le Subject public
    fromEvent(this.opponentSocket, 'message').subscribe((payload: any) => {
      this.messageSubject.next(payload);
    });
    // Réémettre les événements 'new-game' vers le Subject public
    fromEvent(this.opponentSocket, 'new-game').subscribe((game: Game) => {
      this.messageSubject.next({ event: 'new-game', data: game });
    });
  }

  /**
   * Surveille l'état de connexion au serveur WebSocket
   * Retourne un Observable qui émet lorsque la connexion est établie
   */
  onConnect(): Observable<void> {
    return fromEvent(this.opponentSocket, 'connect') as Observable<void>;
  }

  /**
   * Écoute un événement socket arbitraire et retourne un Observable typé
   */
  onEvent<T = any>(event: any) /*: Observable<T>*/ {
    return fromEvent(this.opponentSocket, event) as Observable<T>;
  }

  /**
   * Surveille les déconnexions du serveur WebSocket
   * Retourne un Observable qui émet lorsque la connexion est perdue
   */
  onDisconnect(): Observable<void> {
    return fromEvent(this.opponentSocket, 'disconnect') as Observable<void>;
  }

  /**
   * Capture les erreurs de communication WebSocket
   * Retourne un Observable qui émet en cas d'erreur de connexion ou de communication
   */
  onError(): Observable<Error> {
    return fromEvent(this.opponentSocket, 'error') as Observable<Error>;
  }

  /**
   * Écoute l'arrivée de nouveaux utilisateurs
   * Retourne un Observable qui émet à chaque fois qu'un nouvel utilisateur est ajouté
   */
  onNewUser(): Observable<Game> {
    return fromEvent(this.opponentSocket, 'new-user') as Observable<Game>;
  }

  /**
   * Écoute la réception d'un nouvel état de partie envoyé par l'adversaire
   */
  onNewGame(): Observable<Game> {
    return fromEvent(this.opponentSocket, 'new-game') as Observable<Game>;
  }

  /**
   * Envoie les informations d'un nouvel utilisateur au serveur
   * Cette méthode est void car elle ne fait qu'émettre un événement sans attendre de réponse
   */
  sendMessage(game: Game): void {
    console.log('sending new game via socket', game);
    this.opponentSocket.emit('new-game', game);
  }
}