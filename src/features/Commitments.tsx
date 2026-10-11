import {useState, type FormEvent} from 'react'
import {addCommitment, dayInRange, removeEvent, type CommitmentKind} from '../engine/ledger'
import {Button, Card, Empty, NumberField, SelectField, TextField} from '../components/ui'
import {useNotice} from '../components/Notice'
import {useLedger} from '../store'
import {inr} from '../lib/format'

const KINDS = [['bill', 'Bill'], ['subscription', 'Subscription'], ['income', 'Income']] as const

export default function Commitments() {
  const {ledger, setLedger} = useLedger()
  const notify = useNotice()
  const [kind, setKind] = useState<CommitmentKind>('bill')
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState(0)
  const [day, setDay] = useState(ledger.today)
  const dayOk = dayInRange(ledger, day)
  const ok = label.trim().length > 0 && amount > 0 && dayOk
  const list = ledger.events.filter((e) => e.day >= ledger.today).sort((a, b) => a.day - b.day)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!ok) return
    setLedger(addCommitment(ledger, {kind, label, amount, day}))
    notify(`${KINDS.find((k) => k[0] === kind)?.[1]} added: ${label.trim()} on Day ${day}`)
    setLabel('')
    setAmount(0)
  }

  return (
    <Card title="Commitments and income" hint="Everything that is already promised. Adding or removing one updates your forecast at once.">
      {list.length === 0 ? (
        <Empty>No bills or income left this month. Add one below.</Empty>
      ) : (
        <ul className="list">
          {list.map((e) => (
            <li key={e.id}>
              <span>
                Day {e.day} · {e.label} <small className="tag">{e.kind}</small>
              </span>
              <span className="row-end">
                <b className={e.kind === 'income' ? 'pos' : ''}>
                  {e.kind === 'income' ? '+' : ''}
                  {inr(e.amount)}
                </b>
                <Button
                  variant="ghost"
                  aria-label={`Remove ${e.label} on day ${e.day}`}
                  onClick={() => {
                    setLedger(removeEvent(ledger, e.id))
                    notify(`Removed ${e.label}`)
                  }}
                >
                  Remove
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <h3 className="sub">Add one</h3>
      <form className="form-grid" onSubmit={submit} noValidate>
        <SelectField label="Type" value={kind} onChange={setKind} options={KINDS} />
        <TextField label="Name" value={label} onChange={setLabel} placeholder="Gym pass" />
        <NumberField label="Amount" prefix="₹" value={amount} onChange={setAmount} min={1} />
        <NumberField label="Due on day" value={day} onChange={setDay} min={ledger.today} max={ledger.endDay} error={dayOk ? '' : `Pick a day between ${ledger.today} and ${ledger.endDay}.`} />
        <Button type="submit" disabled={!ok} className="form-submit">
          Add to calendar
        </Button>
      </form>
    </Card>
  )
}
