import {useState, type FormEvent} from 'react'
import {CATEGORIES, type TxnKind} from '../engine/ledger'
import {Button, Card, Empty, NumberField, SelectField, TextField} from '../components/ui'
import {useNotice} from '../components/Notice'
import {useLedger} from '../store'
import {inr} from '../lib/format'

const KINDS = [['expense', 'Money spent'], ['income', 'Money received']] as const
const CAT_OPTIONS = CATEGORIES.map((c) => [c, c[0].toUpperCase() + c.slice(1)] as const)

/** Log real money that moved today. Updates balance, allowance, forecast, risk and health instantly. */
export default function QuickLog() {
  const {ledger, txns, addTxn} = useLedger()
  const notify = useNotice()
  const [kind, setKind] = useState<TxnKind>('expense')
  const [amount, setAmount] = useState(0)
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState<string>('food')
  const tooMuch = kind === 'expense' && amount > ledger.cash
  const error = tooMuch ? `That is more than your cash balance (${inr(ledger.cash)}).` : amount < 0 ? 'Enter an amount above ₹0.' : ''
  const ok = amount > 0 && !tooMuch

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!ok) return
    const name = label.trim() || (kind === 'income' ? 'Income' : category)
    addTxn({kind, amount, label: name, category: kind === 'income' ? 'income' : category})
    notify(`${kind === 'income' ? 'Added' : 'Logged'} ${inr(amount)} · ${name}`)
    setAmount(0)
    setLabel('')
  }

  return (
    <Card title="Log today's money" hint={`Day ${ledger.today}. What you log changes every number in ORBIT.`}>
      <form className="form-grid" onSubmit={submit} noValidate>
        <SelectField label="Type" value={kind} onChange={setKind} options={KINDS} />
        <NumberField label="Amount" prefix="₹" value={amount} onChange={setAmount} min={0} error={error} />
        <TextField label="What for?" value={label} onChange={setLabel} placeholder={kind === 'income' ? 'Tutoring payout' : 'Chai and samosa'} />
        {kind === 'expense' && <SelectField label="Category" value={category} onChange={setCategory} options={CAT_OPTIONS} />}
        <Button type="submit" disabled={!ok} className="form-submit">
          {kind === 'income' ? 'Add income' : 'Log spend'}
        </Button>
      </form>
      <h3 className="sub">Recent entries</h3>
      {txns.length === 0 ? (
        <Empty>Nothing logged yet. Add your first spend above.</Empty>
      ) : (
        <ul className="list">
          {txns.slice(0, 5).map((t) => (
            <li key={t.id}>
              <span>
                Day {t.day} · {t.label}
              </span>
              <b className={t.kind === 'income' ? 'pos' : ''}>
                {t.kind === 'income' ? '+' : '−'}
                {inr(t.amount)}
              </b>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
