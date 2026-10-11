import {describe,it,expect,beforeEach,afterEach} from 'vitest'
import {render,screen,fireEvent,cleanup} from '@testing-library/react'
import App from '../App'
import {letter,reason,BADGE,inr} from '../content/letters'
import {simulate,stressTest} from '../engine'
import {seed} from '../engine/seed'
import {PACKS} from '../content/packs'
beforeEach(()=>localStorage.clear())
afterEach(cleanup)
describe('full app flow',()=>{
 it('onboarding -> home shows the seed numbers -> decide shows the Reality Translator',()=>{
  render(<App/>)
  expect(screen.getByText(/Welcome to ORBIT/)).toBeTruthy()
  fireEvent.click(screen.getByText('Skip: load sample'))
  expect(screen.getByText('₹180')).toBeTruthy()
  expect(screen.getAllByText('₹6,500').length).toBeGreaterThan(0)
  fireEvent.click(screen.getByText('🛒 Decide'))
  expect(screen.getByText(/6 Swiggy orders/)).toBeTruthy()
  expect(screen.getByLabelText('Amount in rupees')).toBeTruthy()
 })
 it('rejects an amount above the cash balance with a clear message',()=>{
  render(<App/>);fireEvent.click(screen.getByText('Skip: load sample'));fireEvent.click(screen.getByText('🛒 Decide'))
  fireEvent.change(screen.getByLabelText('Amount in rupees'),{target:{value:'99999'}})
  expect(screen.getByRole('alert').textContent).toContain('within your cash balance')
 })
})
describe('letters',()=>{
 it('green and red letters use real numbers',()=>{
  expect(letter(simulate(seed(),[],[]))).toContain('₹3,000')
  const a=stressTest(seed(),{kind:'buy',amount:2000,day:6},PACKS[0])[0]
  expect(letter(a)).toContain('Day 20');expect(reason(a)).toContain('Day 26');expect(BADGE[a.risk]).toBe('🔴 Risky');expect(inr(1500)).toBe('₹1,500')})
})
