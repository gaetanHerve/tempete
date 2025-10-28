export class Card {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public moment: string,
    public permanent: boolean,
    public imageUrl: string,
  ) {}
}
