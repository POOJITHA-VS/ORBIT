import {useId, useMemo, useState} from 'react'
import {simulate, type Twin} from '../engine'
import {Button, Card, Empty} from '../components/ui'
import {useNotice} from '../components/Notice'
import {inr} from '../lib/format'

function Row({sub, ledger, base, onCancel}: {sub: Twin['events'][number]; ledger: Twin; base: ReturnType<typeof simulate>; onCancel: () => void}) {
  const id = useId()
  const [uses, setUses] = useState(sub.label === 'Spotify' ? 20 : 4)
  const after = useMemo(() => simulate({...ledger, events: ledger.events.filter((e) => e.id !== sub.id)}, [], []), [ledger, sub.id])
  const u = Math.max(1, uses)
  return (
    <li className="goal">
      <h3>
        {sub.label} · {inr(sub.amount)} on Day {sub.day}
      </h3>
      <div className="field">
        <label htmlFor={id}>Times you use it this month</label>
        <div className="input-wrap">
          <input id={id} type="number" inputMode="numeric" min={1} value={uses} onChange={(e) => setUses(Math.max(1, Math.floor(Number(e.target.value)) || 1))} />
        </div>
      </div>
      <p>
        That is <b>{inr(Math.round(sub.amount / u))} per use</b>. Cancelling saves {inr(sub.amount)} this month and {inr(sub.amount * 12)} a year.
      </p>
      <p className="hint">
        Day-30 free cash {inr(base.forecast)} → <b>{inr(after.forecast)}</b> · health {base.health} → {after.health}
      </p>
      <Button variant="danger" onClick={onCancel}>
        Cancel {sub.label}
      </Button>
    </li>
  )
}

export default function Autopsy({ledger, setLedger}: {ledger: Twin; setLedger: (t: Twin) => void}) {
  const notify = useNotice()
  const subs = ledger.events.filter((e) => e.kind === 'subscription' && e.day >= ledger.today)
  const base = useMemo(() => simulate(ledger, [], []), [ledger])
  return (
    <Card title="Subscription autopsy" hint="Is each subscription worth what it costs you per use?">
      {subs.length === 0 ? (
        <Empty>No subscriptions left to review. Nice.</Empty>
      ) : (
        <ul className="stack goals">
          {subs.map((s) => (
            <Row
              key={s.id}
              sub={s}
              ledger={ledger}
              base={base}
              onCancel={() => {
                setLedger({...ledger, events: ledger.events.filter((e) => e.id !== s.id)})
                notify(`Cancelled ${s.label}. Forecast updated.`)
              }}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
