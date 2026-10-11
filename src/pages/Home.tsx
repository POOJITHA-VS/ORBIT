import {useState} from 'react'
import {advanceDay} from '../engine/ledger'
import RunwayRing from '../components/RunwayRing'
import LazyChart from '../components/LazyChart'
import {Button, Card, PageHeader, RiskBadge, Stat} from '../components/ui'
import {useNotice} from '../components/Notice'
import {useBase} from '../hooks/useScenario'
import {useLedger} from '../store'
import {spentSoFar} from '../engine/seed'
import {inr, RISK} from '../lib/format'
import HealthBreakdown from '../features/HealthBreakdown'
import QuickLog from '../features/QuickLog'
import SpendingBreakdown from '../features/SpendingBreakdown'

export default function Home() {
  const {ledger, metrics: m, base} = useBase()
  const {profile, setLedger} = useLedger()
  const notify = useNotice()
  const [scrub, setScrub] = useState(ledger.today)
  const day = base.days.find((x) => x.day === Math.min(Math.max(scrub, ledger.today), ledger.endDay)) ?? base.days[0]
  const upcoming = ledger.events.filter((e) => e.day >= ledger.today && e.kind !== 'income').sort((a, b) => a.day - b.day)
  const income = ledger.events.filter((e) => e.day >= ledger.today && e.kind === 'income')
  const lastDay = ledger.today >= ledger.endDay

  const next = () => {
    const t = advanceDay(ledger)
    setLedger(t)
    setScrub(t.today)
    notify(`Day ${ledger.today} settled. It is now Day ${t.today}.`)
  }

  const series = [{key: 'free', name: 'Free cash', color: 'var(--accent)'}]
  const data = base.days.map((d) => ({day: d.day, free: d.freeCash}))

  return (
    <>
      <PageHeader title="Your month" lead="₹10,000 to last 30 days. Everything below updates when your money moves." />

      <div className="hero">
        <RunwayRing base={base} today={ledger.today} allowance={m.allowance} />
        <div className="hero-side">
          <p className="persona">
            Money personality: <b>{profile.personality}</b>
          </p>
          <dl className="stats">
            <Stat label="Cash" value={inr(ledger.cash)} />
            <Stat label="Free cash" value={inr(m.free)} />
            <Stat label="Month-end forecast" value={inr(base.forecast)} />
            <Stat label="Risk" value={<RiskBadge risk={base.risk} />} />
            <Stat label="Days left" value={m.days} />
            <Stat label="Goals reserved" value={inr(m.reserved)} />
          </dl>
          <div className="row">
            <Button onClick={next} disabled={lastDay}>
              {lastDay ? 'Last day of the month' : `Settle Day ${ledger.today} and move on`}
            </Button>
          </div>
          <p className="hint">
            Survival at planned spend: {m.survival} days. Spent Days 1–5: {inr(spentSoFar.total)}.
          </p>
        </div>
      </div>

      <div className="two-col">
        <Card title="Month forecast" hint="Free cash after bills, income and your planned daily spend.">
          <LazyChart data={data} series={series} buffer={ledger.buffer} label="Forecast of free cash for the rest of the month" />
          <div className="field">
            <label htmlFor="scrub">
              Day scrubber: Day {day.day} · cash {inr(day.cash)} · free {inr(day.freeCash)} · {RISK[day.risk].glyph} {RISK[day.risk].label}
            </label>
            <input id="scrub" type="range" min={ledger.today} max={ledger.endDay} value={day.day} onChange={(e) => setScrub(+e.target.value)} />
          </div>
        </Card>

        <Card title="Coming up" hint="Bills and subscriptions due, and income on the way.">
          <ul className="list">
            {upcoming.map((e) => (
              <li key={e.id}>
                <span>
                  Day {e.day} · {e.label}
                </span>
                <b>{inr(e.amount)}</b>
              </li>
            ))}
            {income.map((e) => (
              <li key={e.id}>
                <span>
                  Day {e.day} · {e.label}
                </span>
                <b className="pos">+{inr(e.amount)}</b>
              </li>
            ))}
            {upcoming.length + income.length === 0 && <li>Nothing left to pay this month.</li>}
          </ul>
        </Card>
      </div>

      <div className="two-col">
        <HealthBreakdown result={base} twin={ledger} />
        <SpendingBreakdown />
      </div>
      <QuickLog />
    </>
  )
}
