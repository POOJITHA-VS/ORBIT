import {useState, type FormEvent} from 'react'
import {addGoal, contribute, freeCash, removeGoal} from '../engine/ledger'
import {Button, Card, Meter, NumberField, TextField} from '../components/ui'
import {useNotice} from '../components/Notice'
import {useLedger} from '../store'
import {inr} from '../lib/format'

function GoalRow({id, name, target, reserved}: {id: string; name: string; target: number; reserved: number}) {
  const {ledger, setLedger} = useLedger()
  const notify = useNotice()
  const [amt, setAmt] = useState(0)
  const free = freeCash(ledger)
  const error = amt > free ? `You only have ${inr(free)} of free cash.` : ''
  const done = reserved >= target
  const add = (e: FormEvent) => {
    e.preventDefault()
    if (amt <= 0 || amt > free) return
    setLedger(contribute(ledger, id, amt))
    notify(`Moved ${inr(amt)} into ${name}`)
    setAmt(0)
  }
  return (
    <li className="goal">
      <div className="bar-label">
        <h3>{name}</h3>
        <b>
          {inr(reserved)} of {inr(target)}
        </b>
      </div>
      <Meter value={reserved} max={target} label={`${name} progress`} tone={done ? 'green' : undefined} />
      <p className="hint">{done ? 'Goal reached.' : `${inr(target - reserved)} to go · ${Math.round((reserved / target) * 100)}% saved`}</p>
      <form className="inline-form" onSubmit={add} noValidate>
        <NumberField label={`Add to ${name}`} prefix="₹" value={amt} onChange={setAmt} min={0} error={error} />
        <Button type="submit" disabled={amt <= 0 || amt > free}>
          Save it
        </Button>
        {ledger.goals.length > 1 && (
          <Button
            variant="ghost"
            onClick={() => {
              setLedger(removeGoal(ledger, id))
              notify(`Removed ${name}`)
            }}
          >
            Remove goal
          </Button>
        )}
      </form>
    </li>
  )
}

export default function Goals() {
  const {ledger, setLedger} = useLedger()
  const notify = useNotice()
  const [name, setName] = useState('')
  const [target, setTarget] = useState(0)
  const ok = name.trim().length > 0 && target > 0
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!ok) return
    setLedger(addGoal(ledger, name, target))
    notify(`New goal: ${name.trim()}`)
    setName('')
    setTarget(0)
  }
  return (
    <Card title="Savings goals" hint={`Free cash you can still save: ${inr(freeCash(ledger))}. Saved money stays out of your daily allowance.`}>
      <ul className="stack goals">
        {ledger.goals.map((g) => (
          <GoalRow key={g.id} {...g} />
        ))}
      </ul>
      <h3 className="sub">New goal</h3>
      <form className="form-grid" onSubmit={submit} noValidate>
        <TextField label="Goal name" value={name} onChange={setName} placeholder="Concert ticket" />
        <NumberField label="Target" prefix="₹" value={target} onChange={setTarget} min={1} />
        <Button type="submit" disabled={!ok} className="form-submit">
          Add goal
        </Button>
      </form>
    </Card>
  )
}
