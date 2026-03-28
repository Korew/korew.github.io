import { PAYOUT_CONSTANT } from './const'
import type { RollMode, RollResult } from './types'

/**
 * Rounds a number to two decimal places (standard currency precision).
 * Used consistently throughout the game to prevent floating-point drift.
 */
export const roundToCents = (value: number): number =>
  Math.round(value * 100) / 100

/**
 * Simulates a provably-fair dice roll.
 *
 * In a real implementation this would be a server-side call that verifies
 * the result using a seed committed before the roll (provably fair protocol).
 * Here we mock the network latency with a random delay.
 *
 * @param threshold - The threshold separating the win/loss zones (0–100).
 * @param betAmount - The amount the player wagered.
 * @param mode - Whether the player bets on rolling 'under' or 'over' the threshold.
 * @returns A promise resolving to the full result of the roll.
 */
export const mockRoll = async (
  threshold: number,
  betAmount: number,
  mode: RollMode
): Promise<RollResult> => {
  // Simulate server round-trip latency (100–400 ms)
  const delay = Math.random() * 300 + 100
  await new Promise(resolve => setTimeout(resolve, delay))

  const result = Math.floor(Math.random() * 10000) / 100
  const isWin = mode === 'under' ? result < threshold : result > threshold
  const multiplier =
    mode === 'under'
      ? PAYOUT_CONSTANT / threshold
      : PAYOUT_CONSTANT / (100 - threshold)

  const payout = isWin ? roundToCents(betAmount * multiplier) : 0

  return {
    id: Date.now(),
    betType: mode,
    threshold,
    result,
    isWin,
    multiplier,
    payout,
  }
}

/**
 * Constrains a value to the inclusive range [min, max].
 *
 * @param value - The value to constrain.
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
