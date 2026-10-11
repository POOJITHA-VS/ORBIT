import type {Risk} from '../engine'

/** Indian-grouped rupees. Negative values use a real minus sign. */
export const inr = (n: number): string => {
  const v = Math.round(n)
  return `${v < 0 ? '−' : ''}₹${Math.abs(v).toLocaleString('en-IN')}`
}

/** Risk is never colour-only: every level has a label and a distinct shape. */
export const RISK: Record<Risk, {label: string; glyph: string}> = {
  green: {label: 'Chill', glyph: '●'},
  yellow: {label: 'Tight', glyph: '▲'},
  red: {label: 'Risky', glyph: '■'},
}

export const toNumber = (v: string): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
