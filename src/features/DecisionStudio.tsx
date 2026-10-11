import {Card, NumberField, SelectField} from '../components/ui'
import {useLedger, useSandbox} from '../store'
import {translate, type Decision} from '../engine'
import {inr} from '../lib/format'

const KINDS = [['buy', 'Buy something'], ['save', 'Save more'], ['subscribe', 'Add a subscription'], ['emergency', 'Emergency']] as const
const QUICK = [200, 500, 1000, 2000]

export default function DecisionStudio({valid}: {valid: boolean}) {
  const ledger = useLedger((s) => s.ledger)
  const {decision: d, set} = useSandbox()
  const t = translate(d.amount, ledger)
  const patch = (p: Partial<Decision>) => set({decision: {...d, ...p}})
  const amountError = d.amount <= 0 ? 'Enter an amount above ₹0.' : d.amount > ledger.cash ? `Keep it within your cash balance (${inr(ledger.cash)}).` : ''
  const dayError = d.day < ledger.today || d.day > ledger.endDay ? `Pick a day between ${ledger.today} and ${ledger.endDay}.` : ''

  return (
    <Card title="Decision studio" hint="Try a decision on a copy of your month. Nothing is spent until you confirm.">
      <div className="form-grid">
        <SelectField label="What are you thinking about?" value={d.kind} onChange={(kind) => patch({kind})} options={KINDS} />
        <NumberField label="Amount" prefix="₹" value={d.amount} onChange={(amount) => patch({amount})} min={1} error={amountError} />
        <NumberField label="On day" value={d.day} onChange={(day) => patch({day})} min={ledger.today} max={ledger.endDay} error={dayError} />
      </div>
      <div className="chips" role="group" aria-label="Quick amounts">
        {QUICK.map((q) => (
          <button type="button" key={q} className="chip" aria-pressed={d.amount === q} onClick={() => patch({amount: q})}>
            {inr(q)}
          </button>
        ))}
      </div>
      {valid && (
        <p className="callout">
          <b>Reality translator:</b> {inr(d.amount)} is about {t.swiggy} Swiggy orders, {t.allowanceDays} days of allowance, or {t.goalPct}% of your savings.
        </p>
      )}
    </Card>
  )
}
