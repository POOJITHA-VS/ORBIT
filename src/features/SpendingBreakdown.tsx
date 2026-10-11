import {useMemo} from 'react'
import {categoryTotals} from '../engine/ledger'
import {Card, Meter} from '../components/ui'
import {useLedger} from '../store'
import {inr} from '../lib/format'

// Spending already recorded for Days 1–5 (matches engine/seed.ts spentSoFar, minus the total).
const SEED_CATS: Record<string, number> = {food: 650, transport: 300, outings: 350, stationery: 200}

export default function SpendingBreakdown() {
  const txns = useLedger((s) => s.txns)
  const rows = useMemo(() => {
    const totals = categoryTotals(SEED_CATS, txns)
    const sum = Object.values(totals).reduce((a, b) => a + b, 0)
    return {sum, list: Object.entries(totals).sort((a, b) => b[1] - a[1])}
  }, [txns])
  return (
    <Card title="Where it went" hint={`${inr(rows.sum)} spent so far this month`}>
      <ul className="bars">
        {rows.list.map(([cat, amt]) => (
          <li key={cat}>
            <div className="bar-label">
              <span>{cat[0].toUpperCase() + cat.slice(1)}</span>
              <b>{inr(amt)}</b>
            </div>
            <Meter value={amt} max={rows.sum} label={`${cat} spending`} />
          </li>
        ))}
      </ul>
    </Card>
  )
}
