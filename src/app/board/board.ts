import { Component } from '@angular/core';
import { Toolbar } from "../toolbar/toolbar";
import { Hand } from '../hand/hand';
import { Stack } from '../stack/stack';
import { Discard } from '../discard/discard';
import { PlayArea } from '../play-area/play-area';

@Component({
  selector: 'app-board',
  imports: [Toolbar, Hand, Stack, Discard, PlayArea],
  templateUrl: './board.html',
  styleUrl: './board.scss'
})
export class Board {

}
