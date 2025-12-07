import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Card } from '../models/card';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CardAPIService {
  
  private baseUrl = (window as any).__env?.API_URL || 'http://localhost:3000';
  private apiPath = `${this.baseUrl}/cards`;

  private http = inject(HttpClient);

  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(this.apiPath).pipe(
      catchError(this.handleError)
    );
  }

  getCard(id: string): Observable<Card> {
    return this.http.get<Card>(`${this.apiPath}/${encodeURIComponent(id)}`).pipe(
      catchError(this.handleError)
    );
  }

  // create or update (server POST does upsert)
  saveCard(card: Card): Observable<{ created?: boolean; updated?: boolean; id?: string } | any> {
    return this.http.post(this.apiPath, card).pipe(
      catchError(this.handleError)
    );
  }

  // convenience: create card object with _id if not provided
  createCardPayload(id: string, payload: Partial<Card>): Card {
    return { _id: id, ...payload } as Card;
  }

  private handleError(err: HttpErrorResponse) {
    const msg = err.error && err.error.error ? err.error.error : err.message || 'Server error';
    return throwError(() => new Error(msg));
  }
}
