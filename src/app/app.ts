import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Board } from "./board/board";
import { ChessComponent } from './chess/chess.component';
import { ChessService } from './shared/services/chess-service';
import { PieceColor } from './shared/models/chess';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Board, ChessComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  private readonly chessService = inject(ChessService);

  protected readonly isChessPopup: boolean;
  protected readonly popupColor: PieceColor;

  constructor() {
    const params = new URLSearchParams(window.location.search);
    this.isChessPopup = params.get('chess') === 'popup';
    this.popupColor = (params.get('color') as PieceColor) || 'white';
  }

  ngOnInit(): void {
    if (!this.isChessPopup) {
      this.chessService.initAsMain();
    }
  }
}
