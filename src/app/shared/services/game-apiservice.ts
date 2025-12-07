import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class GameAPIService {
  private baseUrl = (window as any).__env?.API_URL || 'http://localhost:3000';
  private apiPath = `${this.baseUrl}/games`;

  private http = inject(HttpClient);

  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.apiPath).pipe(
      catchError(this.handleError)
    );
  }

  getGame(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.apiPath}/${encodeURIComponent(id)}`).pipe(
      catchError(this.handleError)
    );
  }

  // create or update (server POST does upsert)
  saveGame(game: Partial<Game>): Observable<{ created?: boolean; updated?: boolean; id?: string } | any> {
    console.log('creating game')
    return this.http.post(this.apiPath, game).pipe(
      catchError(this.handleError)
    );
  }

  updateGame(id: string, patch: Partial<Game>): Observable<any> {
  return this.http.patch(`${this.apiPath}/${encodeURIComponent(id)}`, patch).pipe(
    catchError(this.handleError)
  );
}

  createGamePayload(id: string, payload: Partial<Game>): Game {
    return { _id: id, ...payload } as Game;
  }

  private handleError(err: HttpErrorResponse) {
    const msg = err.error && err.error.error ? err.error.error : err.message || 'Server error';
    return throwError(() => new Error(msg));
  }
}
