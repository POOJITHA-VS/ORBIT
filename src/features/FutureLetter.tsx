import {useState} from 'react'
import {commit} from '../engine'
import {Button, Card} from '../components/ui'
import {useNotice} from '../components/Notice'
import {useScenario} from '../hooks/useScenario'
import {useLedger, useSandbox} from '../store'
import {LEAD, SIGN, warn} from '../content/personality'
import {letter, reason} from '../lib/copy'
import {inr, RISK} from '../lib/format'

const MOODS = [['excited', 'Excited'], ['unsure', 'Unsure'], ['nervous', 'Nervous']] as const
const NAMES = ['A Buy now', 'B Wait 7 days', 'C Skip']

export default function FutureLetter({onCard}: {onCard: (text: string) => void}) {
  const s = useScenario()
  const {ledger, setLedger, log, park, profile} = useLedger()
  const set = useSandbox((x) => x.set)
  const notify = useNotice()
  const [open, setOpen] = useState(false)
  const [mood, setMood] = useState<string>('excited')
  const pers = profile.personality
  const {decision: d, arr, selected, tab, futures, valid} = s

  const close = () => setOpen(false)
  const buy = () => {
    setLedger(commit(ledger, d))
    log({label: `${d.kind} ${inr(d.amount)}`, mood, amount: d.amount, avoided: false})
    onCard(`Bought ${inr(d.amount)} on Day ${d.day}. Lowest ${inr(arr[0].lowest.freeCash)}. ${RISK[arr[0].risk].label}`)
    notify(`Committed ${inr(d.amount)} on Day ${d.day}`)
    close()
  }
  const skip = () => {
    log({label: `Skipped ${d.kind}`, mood, amount: d.amount, avoided: true})
    onCard(`Skipped ${inr(d.amount)}. Day-30 free cash ${inr(futures.skip.forecast)}. ${RISK[futures.skip.risk].label}`)
    notify(`Skipped ${inr(d.amount)}. Logged as avoided.`)
    close()
  }

  return (
    <Card title="Future You letter and regret check">
      <blockquote className="letter">
        <p>
          {LEAD[pers]}
          {letter(selected)}
        </p>
        <footer>
          {SIGN[pers]} · {NAMES[Math.min(tab, 2)]}
        </footer>
      </blockquote>
      {!open ? (
        <Button onClick={() => setOpen(true)} disabled={!valid}>
          Ready to decide
        </Button>
      ) : (
        <div className="stack">
          <fieldset className="field">
            <legend>Would you still want it in 7 days? How do you feel?</legend>
            <div className="chips">
              {MOODS.map(([v, l]) => (
                <label key={v} className={`chip ${mood === v ? 'on' : ''}`}>
                  <input type="radio" name="mood" value={v} checked={mood === v} onChange={() => setMood(v)} />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="callout warn">
            {warn(pers, arr[0])} {reason(arr[0])}
          </p>
          <div className="row">
            <Button onClick={buy}>Confirm and commit</Button>
            <Button
              variant="ghost"
              onClick={() => {
                park(d)
                notify(`Parked ${inr(d.amount)} on your cooling-off list`)
                close()
              }}
            >
              Park on cooling-off list
            </Button>
            <Button variant="ghost" onClick={skip}>
              Skip it
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                set({tab: 1})
                close()
              }}
            >
              Compare waiting
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
