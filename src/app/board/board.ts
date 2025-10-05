import { Component } from '@angular/core';
import { Toolbar } from "../toolbar/toolbar";
import { Hand } from '../hand/hand';
import { Stack } from '../stack/stack';

@Component({
  selector: 'app-board',
  imports: [Toolbar, Hand, Stack],
  templateUrl: './board.html',
  styleUrl: './board.scss'
})
export class Board {

}
