import {lazy, Suspense} from 'react'
import type {Series} from './ForecastChart'

const Chart = lazy(() => import('./ForecastChart'))

export default function LazyChart(props: {data: Record<string, number>[]; series: Series[]; buffer: number; label: string}) {
  return (
    <Suspense fallback={<div className="chart chart-loading" role="status">Loading chart…</div>}>
      <Chart {...props} />
    </Suspense>
  )
}
