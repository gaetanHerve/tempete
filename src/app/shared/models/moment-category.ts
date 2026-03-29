export enum MomentCategory {
  OWN_TURN = 'own_turn',
  OPPONENT_TURN = 'opponent_turn',
  ANY_TIME = 'any_time',
}

export function getMomentCategory(moment: string): MomentCategory {
  if (moment.includes('à tout moment')) return MomentCategory.ANY_TIME;
  if (moment.includes('adversaire'))    return MomentCategory.OPPONENT_TURN;
  return MomentCategory.OWN_TURN;
}
