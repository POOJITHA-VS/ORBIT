import {describe, it, expect} from 'vitest'
import {simulate} from '../engine'
import {seed} from '../engine/seed'
import {addCommitment, addGoal, advanceDay, categoryTotals, contribute, freeCash, healthBreakdown, logTransaction, removeEvent, removeGoal} from '../engine/ledger'

describe('ORBIT ledger operations', () => {
  it('logs an expense and an income without mutating the input', () => {
    const t = seed(), before = JSON.stringify(t)
    expect(logTransaction(t, {kind: 'expense', amount: 200}).cash).toBe(8300)
    expect(logTransaction(t, {kind: 'income', amount: 500}).cash).toBe(9000)
    expect(JSON.stringify(t)).toBe(before)
  })
  it('ignores zero or negative amounts', () => {
    const t = seed()
    expect(logTransaction(t, {kind: 'expense', amount: 0})).toBe(t)
    expect(logTransaction(t, {kind: 'expense', amount: -5})).toBe(t)
  })
  it('adds a commitment and the forecast drops by exactly its amount', () => {
    const t = seed(), n = addCommitment(t, {kind: 'subscription', label: 'Gym', amount: 300, day: 10})
    expect(simulate(t, [], []).forecast - simulate(n, [], []).forecast).toBe(300)
  })
  it('rejects commitments outside the month or without a name', () => {
    const t = seed()
    expect(addCommitment(t, {kind: 'bill', label: 'x', amount: 10, day: 99})).toBe(t)
    expect(addCommitment(t, {kind: 'bill', label: ' ', amount: 10, day: 10})).toBe(t)
  })
  it('removes an event', () => {
    const t = seed()
    expect(removeEvent(t, 'b12').events.some(e => e.id === 'b12')).toBe(false)
  })
  it('contributes to a goal only within free cash', () => {
    const t = seed(), g = t.goals[0].id
    const n = contribute(t, g, 1000)
    expect(n.goals[0].reserved).toBe(3000)
    expect(freeCash(n)).toBe(5500)
    expect(contribute(t, g, 999999)).toBe(t)
  })
  it('adds goals and keeps at least one', () => {
    const n = addGoal(seed(), 'Concert', 1500)
    expect(n.goals).toHaveLength(2)
    expect(removeGoal(n, n.goals[1].id).goals).toHaveLength(1)
    expect(removeGoal(seed(), 'g1').goals).toHaveLength(1)
  })
  it('advances a day: settles events and planned spend, drops settled events', () => {
    let t = seed()
    for (let i = 0; i < 3; i++) t = advanceDay(t) // days 6, 7, 8
    expect(t.today).toBe(9)
    expect(t.cash).toBe(8500 - 300)
    t = advanceDay(t) // day 9 settles Spotify (59) + planned 100
    expect(t.cash).toBe(8200 - 159)
    expect(t.events.some(e => e.id === 'b9')).toBe(false)
  })
  it('never advances past the last day', () => {
    let t = seed()
    for (let i = 0; i < 40; i++) t = advanceDay(t)
    expect(t.today).toBe(30)
    expect(simulate(t, [], []).days).toHaveLength(1)
  })
  it('sums spending by category', () => {
    const totals = categoryTotals({food: 650}, [
      {id: '1', day: 6, amount: 50, kind: 'expense', label: 'chai', category: 'food'},
      {id: '2', day: 6, amount: 900, kind: 'income', label: 'pay', category: 'income'},
    ])
    expect(totals).toEqual({food: 700})
  })
  it('health breakdown adds up to the engine health score (within rounding)', () => {
    const t = seed(), r = simulate(t, [], [])
    const sum = healthBreakdown(r, t).reduce((s, p) => s + p.score, 0)
    expect(Math.abs(sum - r.health)).toBeLessThanOrEqual(2)
  })
})
