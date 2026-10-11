import {useMemo} from 'react'
import {branch, maxSafePurchase, metrics, simulate, smartFix, translate, type Event} from '../engine'
import {PACKS} from '../content/packs'
import {useLedger, useSandbox} from '../store'

/** Stress shocks currently switched on in the sandbox (packs + custom what-if). */
export function useShocks(): Event[] {
  const packIds = useSandbox((s) => s.packIds)
  const customAmt = useSandbox((s) => s.customAmt)
  const customDay = useSandbox((s) => s.customDay)
  return useMemo(() => {
    const picked = packIds.map((id) => PACKS.find((p) => p.id === id)).filter((p): p is (typeof PACKS)[number] => !!p)
    const custom: Event[] =
      customAmt > 0 ? [{id: 'custom', day: customDay, amount: customAmt, kind: 'shock', label: 'Custom what-if'}] : []
    return [...picked.flatMap((p) => p.events), ...custom]
  }, [packIds, customAmt, customDay])
}

/** The real month with no hypothetical decision applied. */
export function useBase() {
  const ledger = useLedger((s) => s.ledger)
  return useMemo(() => ({ledger, metrics: metrics(ledger), base: simulate(ledger, [], [])}), [ledger])
}

/** Everything the Decide and Stress pages derive from the sandbox decision. Memoised: simulations are cheap but not free. */
export function useScenario() {
  const ledger = useLedger((s) => s.ledger)
  const decision = useSandbox((s) => s.decision)
  const tab = useSandbox((s) => s.tab)
  const shocks = useShocks()

  return useMemo(() => {
    const valid =
      decision.amount > 0 && decision.amount <= ledger.cash && decision.day >= ledger.today && decision.day <= ledger.endDay
    const futures = branch(ledger, decision, shocks)
    const arr = [futures.buyNow, futures.wait7, futures.skip]
    const chart = futures.skip.days.map((x, i) => ({
      day: x.day,
      A: arr[0].days[i].freeCash,
      B: arr[1].days[i].freeCash,
      C: x.freeCash,
    }))
    return {
      ledger,
      decision,
      shocks,
      valid,
      futures,
      arr,
      chart,
      selected: arr[Math.min(tab, 2)],
      tab,
      safe: maxSafePurchase(ledger, shocks, decision.day, decision.kind),
      fixes: valid && arr[0].risk === 'red' ? smartFix(ledger, decision, shocks) : [],
      translated: translate(decision.amount, ledger),
    }
  }, [ledger, decision, tab, shocks])
}
