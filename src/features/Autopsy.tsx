import {useState} from 'react'
import {simulate,type Twin} from '../engine'
const inr=(n:number)=>`₹${n.toLocaleString('en-IN')}`
export default function Autopsy({ledger,setLedger}:{ledger:Twin;setLedger:(t:Twin)=>void}){
 const subs=ledger.events.filter(e=>e.kind==='subscription'&&e.day>=ledger.today)
 const [uses,setUses]=useState<Record<string,number>>({})
 const base=simulate(ledger,[],[])
 return <section className="bg-slate-900 rounded-2xl p-4 space-y-3"><h2 className="font-bold text-lg">Subscription Autopsy</h2>
  {subs.length===0&&<p className="text-sm">No subscriptions left to review. 🎉</p>}
  {subs.map(s=>{const u=uses[s.id]??(s.label==='Spotify'?20:4),after=simulate({...ledger,events:ledger.events.filter(e=>e.id!==s.id)},[],[])
   return <div key={s.id} className="bg-slate-800 rounded-xl p-3 text-sm space-y-1"><b>{s.label} · {inr(s.amount)} on Day {s.day}</b>
    <div>Uses this month <input type="number" className="bg-slate-700 w-14 p-1 rounded" value={u} onChange={e=>setUses({...uses,[s.id]:Math.max(1,+e.target.value)})}/> → <b>{inr(Math.round(s.amount/u))} per use</b></div>
    <div>Cancel it: saves {inr(s.amount)} this month, {inr(s.amount*12)} a year.</div>
    <div>Cancel-it future: Day-30 free cash {inr(base.forecast)} → <b>{inr(after.forecast)}</b> · health {base.health} → {after.health}</div>
    <button className="px-3 py-1.5 rounded-lg bg-rose-600" onClick={()=>setLedger({...ledger,events:ledger.events.filter(e=>e.id!==s.id)})}>Cancel it</button></div>})}
 </section>}
