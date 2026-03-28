export type RollMode = 'under' | 'over'

export type RollResult = {
  id: number
  bet_type: RollMode
  threshold: number
  result: number
  is_win: boolean
  multiplier: number
  profit: number
}
