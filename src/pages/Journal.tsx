import {useState} from 'react'
import {Button, Card, Empty, NumberField, PageHeader} from '../components/ui'
import {useNotice} from '../components/Notice'
import {useLedger, useSandbox, DEFAULT_DECISION} from '../store'
import {inr} from '../lib/format'

export default function Journal() {
  const {ledger, journal, parked, unpark, setLedger, reset, txns} = useLedger()
  const sb = useSandbox()
  const notify = useNotice()
  const [confirming, setConfirming] = useState(false)
  const avoided = journal.filter((j) => j.avoided)

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ledger, journal, parked, txns}, null, 2)], {type: 'application/json'})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'orbit-data.json'
    a.click()
    URL.revokeObjectURL(a.href)
    notify('Exported your ORBIT data')
  }

  return (
    <>
      <PageHeader title="Journal" lead="Your decisions, the impulse buys you avoided, and the settings behind your month." />
      <Card title="Impulse buys avoided" hint={`${avoided.length} skipped · ${inr(avoided.reduce((s, j) => s + j.amount, 0))} not spent`}>
        {journal.length === 0 ? (
          <Empty>No decisions yet. Try one on the Decide page.</Empty>
        ) : (
          <ul className="list">
            {journal.map((j) => (
              <li key={j.id}>
                <span>
                  {j.label}
                  {j.avoided ? ' (avoided)' : ''}
                </span>
                <small className="tag">{j.mood}</small>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Cooling-off list" hint="Parked decisions. Come back in a few days and see if you still want them.">
        {parked.length === 0 ? (
          <Empty>Empty. Park a decision from the regret check to wait it out.</Empty>
        ) : (
          <ul className="list">
            {parked.map((p, i) => (
              <li key={`${p.kind}-${p.amount}-${i}`}>
                <span>
                  {p.kind} {inr(p.amount)} planned for Day {p.day}
                </span>
                <span className="row-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      sb.set({decision: {...p, day: Math.max(p.day, ledger.today)}})
                      window.location.hash = '/decide'
                    }}
                  >
                    Revisit
                  </Button>
                  <Button variant="ghost" onClick={() => unpark(i)} aria-label={`Remove parked ${p.kind} ${inr(p.amount)}`}>
                    Remove
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Settings" hint="These feed every forecast, risk level and allowance.">
        <div className="form-grid">
          <NumberField label="Safety buffer" prefix="₹" value={ledger.buffer} min={1} onChange={(v) => setLedger({...ledger, buffer: Math.max(1, v)})} hint="Free cash below this counts as risky." />
          <NumberField label="Planned spend per day" prefix="₹" value={ledger.plannedDailySpend} min={0} onChange={(v) => setLedger({...ledger, plannedDailySpend: Math.max(0, v)})} hint="Your normal day-to-day spend." />
        </div>
        <div className="row">
          <Button variant="ghost" onClick={exportData}>
            Export my data
          </Button>
          {!confirming ? (
            <Button variant="danger" onClick={() => setConfirming(true)}>
              Reset demo
            </Button>
          ) : (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  reset()
                  sb.set({decision: DEFAULT_DECISION, packIds: [], customAmt: 0, tab: 0})
                  setConfirming(false)
                  notify('Demo reset to Day 6 with ₹10,000 sample data')
                }}
              >
                Yes, erase and restart
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Keep my data
              </Button>
            </>
          )}
        </div>
      </Card>
    </>
  )
}
