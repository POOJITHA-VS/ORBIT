import {useState} from 'react'
import {QUIZ, pick} from '../content/personality'
import {Button, NumberField} from '../components/ui'

export default function Onboarding({onDone}: {onDone: (p: string, buffer: number, goal: number) => void}) {
  const [ans, setAns] = useState<string[]>([])
  const [buffer, setBuffer] = useState(1000)
  const [goal, setGoal] = useState(2000)
  const ready = ans.filter(Boolean).length === QUIZ.length && buffer > 0 && goal > 0

  return (
    <main id="main" className="onboard">
      <h1>Welcome to ORBIT</h1>
      <p className="lead">₹10,000 for 30 days. Answer five quick questions to find your money personality.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (ready) onDone(pick(ans), buffer, goal)
        }}
        noValidate
      >
        {QUIZ.map((q, i) => (
          <fieldset key={q.q} className="quiz">
            <legend>
              {i + 1}. {q.q}
            </legend>
            {q.a.map(([text, type]) => (
              <label key={text} className="choice">
                <input
                  type="radio"
                  name={`q${i}`}
                  value={type}
                  checked={ans[i] === type}
                  onChange={() => {
                    const n = [...ans]
                    n[i] = type
                    setAns(n)
                  }}
                />
                <span>{text}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <fieldset className="quiz">
          <legend>Your numbers</legend>
          <div className="form-grid">
            <NumberField label="Savings goal" prefix="₹" value={goal} onChange={setGoal} min={1} />
            <NumberField label="Safety buffer" prefix="₹" value={buffer} onChange={setBuffer} min={1} hint="The cushion you never want to dip below." />
          </div>
        </fieldset>
        <div className="row">
          <Button type="submit" disabled={!ready}>
            Start with ₹10,000 sample
          </Button>
          <Button variant="ghost" onClick={() => onDone('Planner Owl', 1000, 2000)}>
            Skip and load the sample
          </Button>
        </div>
        {!ready && <p className="hint">Answer all five questions to start with your own personality, or skip.</p>}
      </form>
    </main>
  )
}
