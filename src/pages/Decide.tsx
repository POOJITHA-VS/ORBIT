import {useState} from 'react'
import {PageHeader} from '../components/ui'
import FutureCard from '../components/FutureCard'
import {useScenario} from '../hooks/useScenario'
import DecisionStudio from '../features/DecisionStudio'
import ThreeFutures from '../features/ThreeFutures'
import SmartFix from '../features/SmartFix'
import FutureLetter from '../features/FutureLetter'
import {PACKS} from '../content/packs'
import {useSandbox} from '../store'

export default function Decide() {
  const s = useScenario()
  const packIds = useSandbox((x) => x.packIds)
  const [card, setCard] = useState('')
  const names = packIds.map((id) => PACKS.find((p) => p.id === id)?.name).filter(Boolean)
  return (
    <>
      <PageHeader title="Decide" lead="Simulate before you spend. See what a choice does to your balance, allowance, goals, forecast, risk and health." />
      {names.length > 0 && <p className="callout warn">Stress test is on: {names.join(' + ')}. Change it on the Stress page.</p>}
      <DecisionStudio valid={s.valid} />
      {s.valid && (
        <>
          <ThreeFutures />
          <SmartFix onCommitted={setCard} />
          <FutureLetter onCard={setCard} />
        </>
      )}
      {card && <FutureCard text={card} onClose={() => setCard('')} />}
    </>
  )
}
