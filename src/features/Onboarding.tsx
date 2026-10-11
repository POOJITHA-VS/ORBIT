import {useState} from 'react'
import {QUIZ,pick} from '../content/personality'
export default function Onboarding({onDone}:{onDone:(p:string,buffer:number,goal:number)=>void}){
 const [ans,setAns]=useState<string[]>([]),[buffer,setBuffer]=useState(1000),[goal,setGoal]=useState(2000)
 const ready=ans.filter(Boolean).length===QUIZ.length
 return <div className="min-h-screen text-slate-100 p-4 max-w-xl mx-auto space-y-4">
  <h1 className="text-3xl font-extrabold">🪐 Welcome to ORBIT</h1>
  <p className="text-slate-400">5 quick questions to find your Money Personality.</p>
  {QUIZ.map((q,i)=><div key={i} className="bg-slate-900 rounded-2xl p-3 space-y-1"><b>{i+1}. {q.q}</b>
   {q.a.map(([t,type])=><label key={t} className="block text-sm"><input type="radio" name={'q'+i} onChange={()=>{const n=[...ans];n[i]=type;setAns(n)}}/> {t}</label>)}</div>)}
  <div className="bg-slate-900 rounded-2xl p-3 text-sm space-x-2">Savings goal ₹<input type="number" className="bg-slate-800 p-1 rounded w-24" aria-label="Savings goal in rupees" value={goal} onChange={e=>setGoal(+e.target.value)}/>
   Safety buffer ₹<input type="number" className="bg-slate-800 p-1 rounded w-24" aria-label="Safety buffer in rupees" value={buffer} onChange={e=>setBuffer(Math.max(1,+e.target.value))}/></div>
  <div className="flex gap-2">
   <button disabled={!ready} className="px-4 py-2 rounded-lg bg-indigo-600 disabled:opacity-40" onClick={()=>onDone(pick(ans),buffer,goal)}>Start with ₹10,000 sample</button>
   <button className="px-4 py-2 rounded-lg bg-slate-700" onClick={()=>onDone('Planner Owl',1000,2000)}>Skip: load sample</button></div></div>}
