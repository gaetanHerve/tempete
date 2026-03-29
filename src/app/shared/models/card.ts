export class Card {
  constructor(
    public _id: string,
    public title: string,
    public description: string,
    public moment: string,
    public permanent: boolean,
    public imageUrl: string,
  ) {}
}
