import {CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts'
import {inr} from '../lib/format'

export type Series = {key: string; name: string; color: string; dash?: string}

/** Recharts is heavy, so this file is lazy-loaded. Includes a text alternative for screen readers. */
export default function ForecastChart({
  data,
  series,
  buffer,
  label,
}: {
  data: Record<string, number>[]
  series: Series[]
  buffer: number
  label: string
}) {
  const last = data[data.length - 1]
  const low = data.reduce((m, d) => Math.min(m, ...series.map((s) => d[s.key])), Infinity)
  return (
    <div>
      <div className="chart" role="img" aria-label={`${label}. ${series
        .map((s) => `${s.name} ends at ${inr(last[s.key])}`)
        .join('; ')}. Lowest point across all lines ${inr(low)}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{top: 8, right: 12, bottom: 0, left: 0}}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" stroke="var(--muted)" tick={{fontSize: 12}} />
            <YAxis stroke="var(--muted)" tick={{fontSize: 12}} width={52} tickFormatter={(v) => inr(Number(v))} />
            <Tooltip
              formatter={(v) => inr(Number(v))}
              labelFormatter={(d) => `Day ${d}`}
              contentStyle={{background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, color: 'var(--text)'}}
            />
            <Legend />
            <ReferenceLine y={buffer} stroke="var(--danger)" strokeDasharray="4 4" label={{value: 'buffer', fill: 'var(--danger)', fontSize: 12}} />
            <ReferenceLine y={0} stroke="var(--muted)" />
            {series.map((s) => (
              <Line key={s.key} dataKey={s.key} name={s.name} stroke={s.color} strokeDasharray={s.dash} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="data-table">
        <summary>View chart data as a table</summary>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">{label}</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                {series.map((s) => (
                  <th scope="col" key={s.key}>
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.day}>
                  <th scope="row">{d.day}</th>
                  {series.map((s) => (
                    <td key={s.key}>{inr(d[s.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
