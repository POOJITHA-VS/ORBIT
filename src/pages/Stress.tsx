import {Button, Card, NumberField, PageHeader, RiskBadge} from '../components/ui'
import {useScenario} from '../hooks/useScenario'
import {useSandbox} from '../store'
import {PACKS} from '../content/packs'
import {inr, RISK} from '../lib/format'

const NAMES = ['A Buy now', 'B Wait 7 days', 'C Skip']

export default function Stress() {
  const s = useScenario()
  const sb = useSandbox()
  const {ledger, shocks, selected} = s
  const dup = new Set(shocks.map((e) => `${e.day}-${e.amount}`)).size < shocks.length
  const marked = new Set<number>([...ledger.events.map((e) => e.day), ...shocks.map((e) => e.day), s.decision.day])

  return (
    <>
      <PageHeader title="Stress test" lead="Throw unexpected expenses at your month. This is a what-if, not a prediction." />
      <Card title="Pick the surprises" hint="Tap a pack more than once to take the hit more than once.">
        <div className="chips" role="group" aria-label="Unexpected expense packs">
          {PACKS.map((p) => {
            const n = sb.packIds.filter((x) => x === p.id).length
            return (
              <button type="button" key={p.id} className="chip" aria-pressed={n > 0} onClick={() => sb.set({packIds: [...sb.packIds, p.id]})}>
                {p.name}
                {n > 0 ? ` ×${n}` : ''}
              </button>
            )
          })}
          <button type="button" className="chip chip-clear" onClick={() => sb.set({packIds: [], customAmt: 0})}>
            Clear all
          </button>
        </div>
        <div className="form-grid">
          <NumberField label="Custom shock" prefix="₹" value={sb.customAmt} onChange={(customAmt) => sb.set({customAmt})} min={0} />
          <NumberField label="On day" value={sb.customDay} onChange={(customDay) => sb.set({customDay})} min={ledger.today} max={ledger.endDay} />
        </div>
        {dup && <p className="callout warn">The same shock was added twice. Allowed, but your month takes the hit twice.</p>}
        {shocks.length === 0 && <p className="hint">No shocks on yet. Your month looks like it does on Home.</p>}
      </Card>

      <Card
        title="Risk heatmap"
        hint="One tile per day. A star marks a bill, event or purchase day."
        action={
          <div className="chips" role="group" aria-label="Future to show">
            {NAMES.map((n, i) => (
              <button type="button" key={n} className="chip" aria-pressed={s.tab === i} onClick={() => sb.set({tab: i})}>
                {n}
              </button>
            ))}
          </div>
        }
      >
        <p className="callout" aria-live="polite">
          <RiskBadge risk={selected.risk} /> Lowest {inr(selected.lowest.freeCash)} on Day {selected.lowest.day}. Day-30 free cash {inr(selected.forecast)}.
        </p>
        <ul className="heat">
          {selected.days.map((x) => (
            <li key={x.day} className={`tile tone-${x.risk}`} aria-label={`Day ${x.day}: ${RISK[x.risk].label}, free cash ${inr(x.freeCash)}${marked.has(x.day) ? ', event day' : ''}`}>
              <b>{x.day}</b>
              <span aria-hidden="true">
                {RISK[x.risk].glyph}
                {marked.has(x.day) ? '✱' : ''}
              </span>
            </li>
          ))}
        </ul>
        <div className="row">
          <Button variant="ghost" onClick={() => (window.location.hash = '/decide')}>
            Back to your decision
          </Button>
        </div>
      </Card>
    </>
  )
}
