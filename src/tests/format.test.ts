import {describe, it, expect} from 'vitest'
import {inr, toNumber, RISK} from '../lib/format'
import {letter, reason} from '../lib/copy'
import {simulate} from '../engine'
import {seed} from '../engine/seed'

describe('format helpers', () => {
  it('formats rupees with Indian grouping and a real minus', () => {
    expect(inr(10000)).toBe('₹10,000')
    expect(inr(-500)).toBe('−₹500')
    expect(inr(0)).toBe('₹0')
  })
  it('turns bad input into 0, never NaN', () => {
    expect(toNumber('')).toBe(0)
    expect(toNumber('abc')).toBe(0)
    expect(toNumber('42')).toBe(42)
  })
  it('gives every risk level a label and a glyph so colour is never the only signal', () => {
    for (const k of ['green', 'yellow', 'red'] as const) expect(RISK[k].label && RISK[k].glyph).toBeTruthy()
    expect(new Set(Object.values(RISK).map(r => r.glyph)).size).toBe(3)
  })
  it('writes a letter and a reason for any result', () => {
    const r = simulate(seed(), [{kind: 'buy', amount: 5000, day: 6}], [])
    expect(letter(r).length).toBeGreaterThan(10)
    expect(reason(r)).not.toBe('Comfortable.')
  })
})
