import type {Result} from '../engine'
import {inr, RISK} from '../lib/format'

const TOTAL = 30
const R = 92
const C = 110
const pt = (deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [C + R * Math.cos(a), C + R * Math.sin(a)]
}
const arc = (i: number) => {
  const gap = 2.4
  const a0 = (i * 360) / TOTAL + gap / 2
  const a1 = ((i + 1) * 360) / TOTAL - gap / 2
  const [x0, y0] = pt(a0)
  const [x1, y1] = pt(a1)
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

/** The 30-day month as a ring: one segment per day, past days dimmed, future days coloured by risk. */
export default function RunwayRing({base, today, allowance}: {base: Result; today: number; allowance: number}) {
  const riskByDay = new Map(base.days.map((d) => [d.day, d.risk]))
  const summary = `Day ${today} of ${TOTAL}. Daily allowance ${inr(allowance)}. Month-end risk ${RISK[base.risk].label}. ${
    base.breachDay ? `Buffer first breached on Day ${base.breachDay}.` : 'Buffer is never breached.'
  }`
  return (
    <figure className="ring">
      <svg viewBox="0 0 220 220" role="img" aria-label={summary}>
        {Array.from({length: TOTAL}, (_, i) => {
          const day = i + 1
          const risk = riskByDay.get(day)
          return (
            <path
              key={day}
              d={arc(i)}
              className={risk ? `seg seg-${risk}` : 'seg seg-past'}
              style={{animationDelay: `${i * 18}ms`}}
              strokeWidth={day === today ? 16 : 10}
              fill="none"
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      <figcaption className="ring-core">
        <span className="ring-day">Day {today} of {TOTAL}</span>
        <strong>{inr(allowance)}</strong>
        <span className="ring-sub">safe to spend per day</span>
      </figcaption>
    </figure>
  )
}
