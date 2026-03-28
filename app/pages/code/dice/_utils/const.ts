export const PAYOUT_CONSTANT = 99.91

export const MIN_WIN_CHANCE = 0.02
export const MAX_WIN_CHANCE = 98
export const DEFAULT_WIN_CHANCE = Math.round((PAYOUT_CONSTANT / 2) * 100) / 100

export const MIN_MULTIPLIER = 100 / MAX_WIN_CHANCE
export const MAX_MULTIPLIER = 100 / MIN_WIN_CHANCE
