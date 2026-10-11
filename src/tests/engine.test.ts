import {describe,it,expect} from 'vitest'
import {simulate,branch,stressTest,maxSafePurchase,commit,metrics,smartFix} from '../engine'
import {seed} from '../engine/seed'
import {PACKS} from '../content/packs'
const D={kind:'buy' as const,amount:2000,day:6},exam=PACKS[0]
describe('ORBIT engine',()=>{
 it('1 sample loads',()=>{const m=metrics(seed());expect(m.free).toBe(6500);expect(m.allowance).toBe(180)})
 it('2 three futures',()=>{const b=branch(seed(),D);expect([b.buyNow,b.wait7,b.skip].map(r=>r.lowest.freeCash)).toEqual([1000,1000,3000])})
 it('3 exam week',()=>{const r=stressTest(seed(),D,exam);expect(r.map(x=>x.lowest.freeCash)).toEqual([-500,-500,1500]);expect(r[0].breachDay).toBe(20);expect(r[0].shortfallDay).toBe(26)})
 it('4 max safe',()=>{expect(maxSafePurchase(seed(),[])).toBe(2000);expect(maxSafePurchase(seed(),exam.events)).toBe(500)})
 it('5 ledger untouched',()=>{const t=seed(),b=JSON.stringify(t);branch(t,D,exam.events);smartFix(t,D,exam.events);maxSafePurchase(t,[]);expect(JSON.stringify(t)).toBe(b)})
 it('6 commit then reset',()=>{const t=seed(),c=commit(t,D);expect(c.cash).toBe(6500);expect(JSON.stringify(seed())).toBe(JSON.stringify(t))})
 it('7 day-18 shock leaves earlier days alone',()=>{const a=simulate(seed(),[],[]),b=simulate(seed(),[],[{id:'s',day:18,amount:500,kind:'shock',label:'x'}])
  a.days.forEach((d,i)=>{if(d.day<18)expect(b.days[i].freeCash).toBe(d.freeCash)})})
})
describe('health score (spec samples)',()=>{
 it('A+Exam is about 44 and Skip+Exam about 93',()=>{const r=stressTest(seed(),D,exam);expect(r[0].health).toBe(44);expect(r[2].health).toBe(93)})
 it('bill-day purchase applies both events in order',()=>{const r=simulate(seed(),[{kind:'buy',amount:100,day:12}],[]);expect(r.days.find(x=>x.day===12)!.events.length).toBe(3)})
})
