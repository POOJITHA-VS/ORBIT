import type {Result, Twin} from '../engine'
import {healthBreakdown} from '../engine/ledger'
import {Card, Meter} from '../components/ui'

export default function HealthBreakdown({result, twin}: {result: Result; twin: Twin}) {
  const parts = healthBreakdown(result, twin)
  return (
    <Card title="Financial health" hint="An app indicator for this month, not a credit score.">
      <p className="big-score">
        <strong>{result.health}</strong>
        <span>/ 100</span>
      </p>
      <ul className="bars">
        {parts.map((p) => (
          <li key={p.key}>
            <div className="bar-label">
              <span>{p.label}</span>
              <b>
                {p.score}/{p.max}
              </b>
            </div>
            <Meter value={p.score} max={p.max} label={`${p.label} score`} tone={p.score / p.max >= 0.8 ? 'green' : p.score / p.max >= 0.5 ? 'yellow' : 'red'} />
            <small className="hint">{p.note}</small>
          </li>
        ))}
      </ul>
    </Card>
  )
}
