import { Card } from "./card";

export class Game {
  constructor(
    public _id: string,
    public player1: string,
    public player2: string,
    public player1Hand: Card[],
    public player2Hand: Card[],
    public playArea: Card[],
    public discard: Card[],
    public stack: Card[],
    public currentTurn: 'player1' | 'player2' = 'player1',
    public player1PlayedThisTurn: boolean = false,
    public player2PlayedThisTurn: boolean = false
  ) {}
}
