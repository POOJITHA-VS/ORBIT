import {describe,it,expect,afterEach} from 'vitest'
import {render,screen,cleanup} from '@testing-library/react'
import Onboarding from '../features/Onboarding'
import Heatmap from '../components/Heatmap'
import GoalRing from '../components/GoalRing'
import ConsequenceChain from '../components/ConsequenceChain'
import {num} from '../lib/num'
import {simulate} from '../engine'
import {seed} from '../engine/seed'
afterEach(cleanup)
describe('components & sanitising',()=>{
 it('Onboarding start button is disabled until the quiz is answered',()=>{render(<Onboarding onDone={()=>{}}/>);expect((screen.getByText('Start with ₹10,000 sample') as HTMLButtonElement).disabled).toBe(true)})
 it('Heatmap renders one labelled tile per day (Day 6-30)',()=>{const r=simulate(seed(),[],[]);render(<Heatmap days={r.days} marked={d=>d===9} inr={n=>'₹'+n}/>);expect(screen.getAllByRole('listitem').length).toBe(25);expect(screen.getByLabelText(/Day 9,.*bill or event day/)).toBeTruthy()})
 it('GoalRing exposes an accessible label',()=>{render(<GoalRing reserved={2000} target={2000}/>);expect(screen.getByRole('img').getAttribute('aria-label')).toContain('100%')})
 it('ConsequenceChain shows four steps',()=>{render(<ConsequenceChain purchase="₹2,000" balance="₹1,000" allowance="₹40/day" goal="safe"/>);expect(screen.getAllByRole('listitem').length).toBe(4)})
 it('num() clamps and rejects NaN/Infinity',()=>{expect(num('abc',0,100)).toBe(0);expect(num('9e99',0,100)).toBe(0);expect(num(-5,0,100)).toBe(0);expect(num(500,0,100)).toBe(100);expect(num('42.6',0,100)).toBe(43)})
})
