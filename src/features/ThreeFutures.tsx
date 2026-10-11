import LazyChart from '../components/LazyChart'
import {Card, RiskBadge} from '../components/ui'
import {useScenario} from '../hooks/useScenario'
import {useSandbox} from '../store'
import {reason} from '../lib/copy'
import {inr} from '../lib/format'

const NAMES = ['A · Buy now', 'B · Wait 7 days', 'C · Skip'] as const
const SERIES = [
  {key: 'A', name: 'A Buy now', color: '#ff8a3d'},
  {key: 'B', name: 'B Wait 7', color: '#4cc9f0', dash: '6 3'},
  {key: 'C', name: 'C Skip', color: '#3ddc97', dash: '2 3'},
]

export default function ThreeFutures() {
  const s = useScenario()
  const setTab = useSandbox((x) => x.set)
  const {decision: d, ledger, arr, tab, selected} = s
  return (
    <Card title="Three futures" hint="Same month, three choices. Pick one to read its consequences.">
      <LazyChart data={s.chart} series={SERIES} buffer={ledger.buffer} label="Free cash by day for buy now, wait 7 days and skip" />
      <div className="futures" role="group" aria-label="Choose a future">
        {arr.map((r, i) => (
          <button key={NAMES[i]} className="future" aria-pressed={tab === i} onClick={() => setTab({tab: i})}>
            <b>{NAMES[i]}</b>
            <RiskBadge risk={r.risk} />
            <span>
              Health {r.health} · lowest {inr(r.lowest.freeCash)} (Day {r.lowest.day})
            </span>
            <small>{reason(r)}</small>
          </button>
        ))}
      </div>
      <p className="callout" aria-live="polite">
        <b>Consequence chain:</b> {inr(d.amount)} on Day {d.day} → Day-30 balance {inr(selected.forecast)} → allowance {inr(selected.allowance)}/day → savings goal{' '}
        {selected.lowest.freeCash < 0 ? 'underfunded' : 'safe'}.
      </p>
      <details className="rule">
        <summary>How risk is decided</summary>
        <p>
          Chill: lowest free cash is at least 2× your buffer ({inr(2 * ledger.buffer)}). Tight: between the buffer and 2× buffer. Risky: below the buffer, a bill goes unpaid, or free cash
          goes negative and touches savings. Buying now and waiting end the same unless income, a price or a bill lands in between, so waiting mostly protects the days in the middle and gives
          you time for the regret check.
        </p>
      </details>
    </Card>
  )
}
