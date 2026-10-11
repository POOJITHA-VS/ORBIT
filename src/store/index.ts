import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {seed} from '../engine/seed'
import {logTransaction, type Txn} from '../engine/ledger'
import type {Twin, Decision} from '../engine'

export type Entry = {id: number; label: string; mood: string; amount: number; avoided: boolean}
type Profile = {personality: string; onboarded: boolean}

type Ledger = {
  ledger: Twin
  journal: Entry[]
  parked: Decision[]
  txns: Txn[]
  profile: Profile
  setProfile: (p: Profile) => void
  setLedger: (t: Twin) => void
  log: (e: Omit<Entry, 'id'>) => void
  park: (d: Decision) => void
  unpark: (index: number) => void
  addTxn: (x: Omit<Txn, 'id' | 'day'>) => void
  reset: () => void
}

export const useLedger = create<Ledger>()(
  persist(
    (set) => ({
      ledger: seed(),
      journal: [],
      parked: [],
      txns: [],
      profile: {personality: 'Planner Owl', onboarded: false},
      setProfile: (profile) => set({profile}),
      setLedger: (ledger) => set({ledger}),
      log: (e) => set((s) => ({journal: [{...e, id: Date.now()}, ...s.journal]})),
      park: (d) => set((s) => ({parked: [...s.parked, d]})),
      unpark: (i) => set((s) => ({parked: s.parked.filter((_, idx) => idx !== i)})),
      addTxn: (x) =>
        set((s) => ({
          ledger: logTransaction(s.ledger, x),
          txns: [{...x, id: `t${Date.now()}`, day: s.ledger.today}, ...s.txns],
        })),
      reset: () => set({ledger: seed(), journal: [], parked: [], txns: []}),
    }),
    {name: 'orbit-ledger2'},
  ),
)

type Sandbox = {
  decision: Decision
  packIds: string[]
  customAmt: number
  customDay: number
  tab: number
  set: (p: Partial<Omit<Sandbox, 'set'>>) => void
}

export const DEFAULT_DECISION: Decision = {kind: 'buy', amount: 2000, day: 6}

export const useSandbox = create<Sandbox>()(
  persist(
    (set) => ({
      decision: DEFAULT_DECISION,
      packIds: [],
      customAmt: 0,
      customDay: 20,
      tab: 0,
      set: (p) => set(p),
    }),
    {name: 'orbit-sandbox2'},
  ),
)
