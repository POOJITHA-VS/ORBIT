// Ledger operations built on top of the pure engine.
// Every function returns a NEW Twin (or derived data) and never mutates its input.
import type {Event, Result, Twin} from './index'

export type TxnKind = 'expense' | 'income'
export type Txn = {id: string; day: number; amount: number; kind: TxnKind; label: string; category: string}
export type CommitmentKind = 'bill' | 'subscription' | 'income'
export type Commitment = {label: string; amount: number; day: number; kind: CommitmentKind}

export const CATEGORIES = ['food', 'transport', 'outings', 'stationery', 'shopping', 'other'] as const

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
const reservedOf = (t: Twin) => t.goals.reduce((s, g) => s + g.reserved, 0)
const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const freeCash = (t: Twin) => t.cash - reservedOf(t)
export const dayInRange = (t: Twin, day: number) => Number.isInteger(day) && day >= t.today && day <= t.endDay

/** Log money that already moved today (a coffee, a payout). */
export function logTransaction(t: Twin, x: Pick<Txn, 'kind' | 'amount'>): Twin {
  if (!(x.amount > 0)) return t
  const c = clone(t)
  c.cash += x.kind === 'income' ? x.amount : -x.amount
  return c
}

/** Add a future bill, subscription or income to the calendar. */
export function addCommitment(t: Twin, c: Commitment): Twin {
  if (!(c.amount > 0) || !c.label.trim() || !dayInRange(t, c.day)) return t
  const n = clone(t)
  const ev: Event = {id: uid('e'), day: c.day, amount: c.amount, kind: c.kind, label: c.label.trim()}
  n.events.push(ev)
  return n
}

export function removeEvent(t: Twin, id: string): Twin {
  return {...clone(t), events: t.events.filter(e => e.id !== id)}
}

export function addGoal(t: Twin, name: string, target: number): Twin {
  if (!name.trim() || !(target > 0)) return t
  const n = clone(t)
  n.goals.push({id: uid('g'), name: name.trim(), target, reserved: 0})
  return n
}

export function removeGoal(t: Twin, id: string): Twin {
  if (t.goals.length <= 1) return t // the engine always needs one goal for "save" decisions
  return {...clone(t), goals: t.goals.filter(g => g.id !== id)}
}

/** Move free cash into a goal. Cannot reserve more than the free cash available. */
export function contribute(t: Twin, goalId: string, amount: number): Twin {
  if (!(amount > 0) || amount > freeCash(t)) return t
  const n = clone(t)
  const g = n.goals.find(x => x.id === goalId)
  if (!g) return t
  g.reserved += amount
  return n
}

/** Move one day forward: settle today's events and planned spend into cash. */
export function advanceDay(t: Twin): Twin {
  if (t.today >= t.endDay) return t
  const n = clone(t)
  for (const e of n.events.filter(x => x.day === n.today)) {
    if (e.category === 'transfer') continue
    n.cash += e.kind === 'income' ? e.amount : -e.amount
  }
  n.cash -= n.plannedDailySpend
  n.events = n.events.filter(e => e.day > n.today)
  n.today += 1
  return n
}

export function categoryTotals(base: Record<string, number>, txns: Txn[]): Record<string, number> {
  const out = {...base}
  for (const x of txns) if (x.kind === 'expense') out[x.category] = (out[x.category] ?? 0) + x.amount
  return out
}

export type HealthPart = {key: string; label: string; score: number; max: number; note: string}

/** Same formula as engine.healthScore, split into the four parts so the UI can explain it. */
export function healthBreakdown(r: Result, t: Twin): HealthPart[] {
  const b = t.buffer, res = reservedOf(t), low = r.lowest.freeCash
  const buffer = 30 * Math.min(Math.max(low / (2 * b), 0), 1)
  const bills = r.unpayable ? 0 : 25
  const goals = res > 0 ? 25 * Math.max(0, 1 - Math.max(0, -low) / res) : 25
  const pace = t.plannedDailySpend > 0 ? 20 * Math.min(r.allowance / t.plannedDailySpend, 1) : 20
  return [
    {key: 'buffer', label: 'Safety buffer', score: Math.round(buffer), max: 30, note: 'How far your lowest point stays above the buffer'},
    {key: 'bills', label: 'Bills covered', score: bills, max: 25, note: r.unpayable ? 'A bill or subscription cannot be paid' : 'Every bill and subscription is payable'},
    {key: 'goals', label: 'Goal safety', score: Math.round(goals), max: 25, note: 'How much of your savings stays untouched'},
    {key: 'pace', label: 'Spending pace', score: Math.round(pace), max: 20, note: 'Allowance compared with your planned daily spend'},
  ]
}
