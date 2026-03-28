import { PAYOUT_CONSTANT } from './const'
import type { RollMode, RollResult } from './types'

/**
 * Simulates a dice roll with a random result and calculates
 * the outcome based on the given threshold, bet amount, and mode.
 * @param threshold The threshold value for winning.
 * @param betAmount The amount of the bet.
 * @param mode The roll mode, either 'under' or 'over'.
 * @returns A promise that resolves to the result of the roll.
 */
export const mockRoll = async (
  threshold: number,
  betAmount: number,
  mode: RollMode
): Promise<RollResult> => {
  const randomDelay = Math.random() * 300 + 100 // Random delay between 100ms and 400ms
  await new Promise(resolve => setTimeout(resolve, randomDelay))

  const result = Math.floor(Math.random() * 10000) / 100
  const is_win = mode === 'under' ? result < threshold : result > threshold
  const multiplier =
    mode === 'under'
      ? PAYOUT_CONSTANT / threshold
      : PAYOUT_CONSTANT / (100 - threshold)
  const profit = is_win ? betAmount * multiplier : 0

  return {
    id: new Date().getTime(),
    bet_type: mode,
    threshold,
    result,
    is_win,
    multiplier,
    profit,
  }
}

/**
 * Constrains a value between a minimum and maximum.
 * @param value The value to constrain.
 * @param min The minimum allowed value.
 * @param max The maximum allowed value.
 * @returns The value clamped to [min, max].
 */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
