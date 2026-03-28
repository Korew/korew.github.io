/** Direction of the bet relative to the threshold. */
export type RollMode = 'under' | 'over'

/** The full outcome of a single dice roll. */
export type RollResult = {
  /** Unique identifier for this roll (epoch timestamp in ms). */
  id: number
  /** Whether the player bet on rolling under or over the threshold. */
  betType: RollMode
  /** The threshold value set by the player before rolling. */
  threshold: number
  /** The randomly generated roll value in the range [0.00, 100.00). */
  result: number
  /** Whether this roll satisfied the win condition. */
  isWin: boolean
  /** The multiplier applied to the bet on a win. */
  multiplier: number
  /**
   * Total amount returned to the player from this roll.
   * - Win: `bet × multiplier`
   * - Loss: `0`
   *
   * Net profit = `payout - bet`.
   */
  payout: number
}
