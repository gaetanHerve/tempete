import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { Game } from '../models/game';
import { environment } from '../../../environments/environment';

export interface GameRoomPayload {
  roomCode: string;
  playerNumber: 'player1' | 'player2';
}

@Injectable({
  providedIn: 'root'
})
export class GameSocketService {

  private socket!: Socket;
  private fallbackUsed = false;

  private connect$ = new Subject<void>();
  private disconnect$ = new Subject<void>();
  private gameState$ = new Subject<Game>();
  private joinError$ = new Subject<{ message: string }>();
  private opponentJoined$ = new Subject<void>();
  private opponentDisconnected$ = new Subject<void>();
  private chessMove$ = new Subject<any>();

  constructor() {
    this.initSocket(environment.socketUrl);
  }

  private initSocket(url: string): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => this.connect$.next());
    this.socket.on('disconnect', () => this.disconnect$.next());
    this.socket.on('new-game', (game: Game) => this.gameState$.next(game));
    this.socket.on('join-error', (data: { message: string }) => this.joinError$.next(data));
    this.socket.on('opponent-joined', () => this.opponentJoined$.next());
    this.socket.on('opponent-disconnected', () => this.opponentDisconnected$.next());
    this.socket.on('chess-move', (board: any) => this.chessMove$.next(board));

    const fallback = (environment as any).fallbackSocketUrl as string | undefined;
    if (!this.fallbackUsed && fallback) {
      this.socket.once('connect_error', () => {
        this.fallbackUsed = true;
        this.initSocket(fallback);
      });
    }
  }

  createGame(): Observable<GameRoomPayload> {
    this.socket.emit('create-game');
    return new Observable<GameRoomPayload>(observer => {
      this.socket.once('game-created', (payload: GameRoomPayload) => {
        observer.next(payload);
        observer.complete();
      });
    });
  }

  joinGame(roomCode: string): Observable<GameRoomPayload> {
    this.socket.emit('join-game', roomCode);
    return new Observable<GameRoomPayload>(observer => {
      this.socket.once('game-joined', (payload: GameRoomPayload) => {
        observer.next(payload);
        observer.complete();
      });
    });
  }

  sendGameState(roomCode: string, game: Game): void {
    this.socket.emit('new-game', { roomCode, game });
  }

  onGameState(): Observable<Game> {
    return this.gameState$.asObservable();
  }

  onJoinError(): Observable<{ message: string }> {
    return this.joinError$.asObservable();
  }

  onOpponentJoined(): Observable<void> {
    return this.opponentJoined$.asObservable();
  }

  onOpponentDisconnected(): Observable<void> {
    return this.opponentDisconnected$.asObservable();
  }

  onConnect(): Observable<void> {
    return this.connect$.asObservable();
  }

  onDisconnect(): Observable<void> {
    return this.disconnect$.asObservable();
  }

  sendChessMove(roomCode: string, board: any): void {
    this.socket.emit('chess-move', { roomCode, board });
  }

  onChessMove(): Observable<any> {
    return this.chessMove$.asObservable();
  }
}
