
export class Game {
  constructor(
    public _id: string,
    public player1: string,
    public player2: string,
    public player1Hand: string[],
    public player2Hand: string[],
    public playArea: string[],
    public discard: string[],
    public stack: string[]
  ) {}
}
