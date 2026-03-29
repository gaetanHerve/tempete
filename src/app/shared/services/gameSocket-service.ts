import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';
import { Game } from '../models/game';
import { socket_URL } from '../../env.json';

export interface GameRoomPayload {
  roomCode: string;
  playerNumber: 'player1' | 'player2';
}

@Injectable({
  providedIn: 'root'
})
export class GameSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(socket_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      extraHeaders: { 'ngrok-skip-browser-warning': 'true' }
    });
  }

  createGame(): Observable<GameRoomPayload> {
    this.socket.emit('create-game');
    return (fromEvent(this.socket, 'game-created') as Observable<GameRoomPayload>).pipe(take(1));
  }

  joinGame(roomCode: string): Observable<GameRoomPayload> {
    this.socket.emit('join-game', roomCode);
    return (fromEvent(this.socket, 'game-joined') as Observable<GameRoomPayload>).pipe(take(1));
  }

  onJoinError(): Observable<{ message: string }> {
    return fromEvent(this.socket, 'join-error') as Observable<{ message: string }>;
  }

  sendGameState(roomCode: string, game: Game): void {
    this.socket.emit('new-game', { roomCode, game });
  }

  onGameState(): Observable<Game> {
    return fromEvent(this.socket, 'new-game') as Observable<Game>;
  }

  onOpponentJoined(): Observable<void> {
    return fromEvent(this.socket, 'opponent-joined') as Observable<void>;
  }

  onOpponentDisconnected(): Observable<void> {
    return fromEvent(this.socket, 'opponent-disconnected') as Observable<void>;
  }

  onConnect(): Observable<void> {
    return fromEvent(this.socket, 'connect') as Observable<void>;
  }

  onDisconnect(): Observable<void> {
    return fromEvent(this.socket, 'disconnect') as Observable<void>;
  }
}
