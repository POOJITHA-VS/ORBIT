import {PageHeader} from '../components/ui'
import Autopsy from '../features/Autopsy'
import Commitments from '../features/Commitments'
import Goals from '../features/Goals'
import {useLedger} from '../store'

export default function Plan() {
  const {ledger, setLedger} = useLedger()
  return (
    <>
      <PageHeader title="Plan" lead="Savings goals, bills, subscriptions and income. The promises your month has to keep." />
      <Goals />
      <Commitments />
      <Autopsy ledger={ledger} setLedger={setLedger} />
    </>
  )
}
