import {commit} from '../engine'
import {Button, Card, Empty, RiskBadge} from '../components/ui'
import {useNotice} from '../components/Notice'
import {useScenario} from '../hooks/useScenario'
import {useLedger, useSandbox} from '../store'
import {inr} from '../lib/format'

export default function SmartFix({onCommitted}: {onCommitted: (text: string) => void}) {
  const s = useScenario()
  const {setLedger, log} = useLedger()
  const set = useSandbox((x) => x.set)
  const notify = useNotice()
  const {decision: d, arr, safe, valid, fixes} = s
  const picked = s.shocks.length > 0

  return (
    <Card title="Breaking point and smart fix" hint={`The most you can safely spend on Day ${d.day}${picked ? ' with your stress test on' : ''}.`}>
      <p className="big-line">
        <b>{inr(safe)}</b> max safe
      </p>
      <div className="field">
        <label htmlFor="amt-slider">
          Try an amount: {inr(d.amount)} · <RiskBadge risk={arr[0].risk} /> · lowest {inr(arr[0].lowest.freeCash)}
        </label>
        <input id="amt-slider" type="range" min={0} max={5000} step={10} value={d.amount} onChange={(e) => set({decision: {...d, amount: +e.target.value}})} />
      </div>
      {!valid ? (
        <Empty>Fix the amount or day in the studio to see fixes.</Empty>
      ) : fixes.length === 0 ? (
        <p className="ok">{arr[0].risk === 'red' ? 'No single proven fix found. Try a smaller amount.' : 'No fix needed. This purchase passes.'}</p>
      ) : (
        <ul className="list fixes">
          {fixes.map((x) => (
            <li key={x.label}>
              <span>{x.label}. Month survives.</span>
              <Button
                onClick={() => {
                  if (x.kind === 'price' || x.kind === 'delay') {
                    set({decision: x.decision})
                    notify(`Studio updated: ${x.label}`)
                  } else {
                    setLedger(commit(x.twin, x.decision))
                    log({label: `${x.decision.kind} ${inr(x.decision.amount)}`, mood: 'neutral', amount: x.decision.amount, avoided: false})
                    onCommitted(`Fix applied: ${x.label}`)
                  }
                }}
              >
                {x.kind === 'cancel' || x.kind === 'trim' ? 'Apply and commit' : 'Use this'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
