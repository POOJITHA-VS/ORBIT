import {useState,useMemo,lazy,Suspense,createContext,useContext} from 'react'
import {motion} from 'framer-motion'
import Onboarding from './features/Onboarding'
import Autopsy from './features/Autopsy'
import FutureCard from './components/FutureCard'
import {BADGE,inr,reason,letter} from './content/letters'
import Heatmap from './components/Heatmap'
import ConsequenceChain from './components/ConsequenceChain'
import GoalRing from './components/GoalRing'
import {num} from './lib/num'
import {LEAD,SIGN,warn} from './content/personality'
import {branch,simulate,maxSafePurchase,smartFix,commit,metrics,translate,type Result,type Event,type Decision} from './engine'
import {spentSoFar} from './engine/seed'
import {PACKS} from './content/packs'
import {useLedger,useSandbox} from './store'

const Timeline=lazy(()=>import('./components/Timeline'))
const Ctx=createContext('home')
const Card=({id,title,children}:{id:string;title:string;children:React.ReactNode})=>{const sc=useContext(Ctx);return sc!==id?null:<motion.section initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="bg-slate-900 rounded-2xl p-4 space-y-3"><h2 className="font-bold text-lg">{title}</h2>{children}</motion.section>}
const btn='px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm'

export default function App(){
 const {ledger,setLedger,journal,parked,log,park,reset,profile,setProfile}=useLedger()
 const [screen,setScreen]=useState('home'),pers=profile.personality
 const sb=useSandbox(),d=sb.decision
 const [tab,setTab]=useState(0),[card,setCard]=useState(''),[mood,setMood]=useState('😍'),[regret,setRegret]=useState(false),[scrub,setScrub]=useState(ledger.today)
 const picked=sb.packIds.map(id=>PACKS.find(p=>p.id===id)!).filter(Boolean)
 const shocks:Event[]=useMemo(()=>[...sb.packIds.flatMap(id=>PACKS.find(p=>p.id===id)?.events??[]),...(sb.customAmt>0?[{id:'custom',day:sb.customDay,amount:sb.customAmt,kind:'shock' as const,label:'Custom what-if'}]:[])],[sb.packIds,sb.customAmt,sb.customDay])
 const m=metrics(ledger),base=simulate(ledger,[],[])
 const valid=d.amount>0&&d.amount<=ledger.cash&&d.day>=ledger.today&&d.day<=ledger.endDay
 const f=useMemo(()=>branch(ledger,d,shocks),[ledger,d,shocks]),arr=[f.buyNow,f.wait7,f.skip],names=['A Buy now','B Wait 7 days','C Skip']
 const data=f.skip.days.map((x,i)=>({day:x.day,A:arr[0].days[i].freeCash,B:arr[1].days[i].freeCash,C:x.freeCash}))
 const safe=useMemo(()=>maxSafePurchase(ledger,shocks,d.day,d.kind),[ledger,shocks,d.day,d.kind]),fixes=useMemo(()=>valid&&arr[0].risk==='red'?smartFix(ledger,d,shocks):[],[ledger,d,shocks,valid,arr[0].risk])
 const tr=translate(d.amount,ledger),sel=arr[tab],sc=base.days.find(x=>x.day===scrub)!
 const dup=new Set(shocks.map(e=>e.day+'-'+e.amount)).size<shocks.length
 const live=scrub<ledger.endDay?simulate({...ledger,today:scrub+1,cash:sc.cash,events:ledger.events.filter(e=>e.day>scrub)},[],[]):{...base,allowance:0,risk:sc.risk}
 const avoided=journal.filter(j=>j.avoided)
 const set=(p:Partial<Decision>)=>{sb.set({decision:{...d,...p}});setRegret(false)}
 const done=(t:typeof ledger,dec:Decision,text:string)=>{setLedger(t);log({label:`${dec.kind} ${inr(dec.amount)}`,mood,amount:dec.amount,avoided:false});setCard(text);setRegret(false)}
 const mark=(e:Result)=>(day:number)=>[...ledger.events,...(shocks)].some(v=>v.day===day)||day===d.day

 if(!profile.onboarded)return <Onboarding onDone={(p,b,g)=>{setProfile({personality:p,onboarded:true});setLedger({...ledger,buffer:b,goals:[{...ledger.goals[0],target:g}]})}}/>
 const NAV=[['home','🏠 Home'],['decide','🛒 Decide'],['futures','🔮 Futures'],['stress','⚡ Stress'],['fix','🛠 Fix'],['autopsy','🧾 Subs'],['letter','💌 Letter'],['journal','📓 Journal']]
 return <Ctx.Provider value={screen}><div className="min-h-screen text-slate-100 p-4 max-w-3xl mx-auto space-y-4" id="main" tabIndex={-1} role="main">
  <h1 className="text-3xl font-extrabold">🪐 ORBIT <span className="text-sm font-normal text-slate-400">What happens to my month if I do this?</span></h1>

  <div role="navigation" aria-label="Screens" className="flex flex-wrap gap-1">{NAV.map(([k,l])=><button key={k} aria-current={screen===k?'page':undefined} onClick={()=>setScreen(k)} className={`px-3 py-1.5 rounded-lg text-sm ${screen===k?'bg-indigo-600':'bg-slate-800'}`}>{l}</button>)}</div>
  {screen==='autopsy'&&<Autopsy ledger={ledger} setLedger={setLedger}/>}
  <Card id="home" title="Your Month (Home)">
   <p className="text-sm">🎭 Money Personality: <b>{pers}</b></p><GoalRing reserved={m.reserved} target={ledger.goals[0].target}/><div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
    <div>Cash<b className="block text-xl">{inr(ledger.cash)}</b></div><div>Free cash<b className="block text-xl">{inr(m.free)}</b></div>
    <div>Days left<b className="block text-xl">{m.days}</b></div><div>Allowance/day<b className="block text-xl">{inr(m.allowance)}</b></div>
    <div>Risk<b className="block text-xl">{BADGE[base.risk]}</b></div><div>Health (app indicator, not a credit score)<b className="block text-xl">{base.health}/100</b></div>
    <div>Goal reserved<b className="block text-xl">{inr(m.reserved)}</b></div><div>Month-end forecast<b className="block text-xl">{inr(base.forecast)}</b></div></div>
   <p className="text-xs text-slate-400">Spent Days 1–5: {inr(spentSoFar.total)} · Survival {m.survival} days (planned spend) · Upcoming: {ledger.events.filter(e=>e.day>=ledger.today&&e.kind!=='income').map(e=>`D${e.day} ${e.label} ${inr(e.amount)}`).join(' · ')}</p>
   <label className="text-sm block">Day Scrubber: Day {scrub} · cash {inr(sc.cash)} · free {inr(sc.freeCash)} · allowance {inr(live.allowance)}/day · health {live.health} · {BADGE[live.risk]}
    <input type="range" aria-label="Day scrubber" className="w-full" min={ledger.today} max={ledger.endDay} value={scrub} onChange={e=>setScrub(+e.target.value)}/></label>
  </Card>

  <Card id="decide" title="Decision Studio">
   <div className="flex flex-wrap gap-2 items-center text-sm">
    <select aria-label="Decision type" className="bg-slate-800 p-1.5 rounded" value={d.kind} onChange={e=>set({kind:e.target.value as Decision['kind']})}><option value="buy">Buy</option><option value="save">Save more</option><option value="subscribe">Add subscription</option><option value="emergency">Emergency</option></select>
    ₹<input type="number" aria-label="Amount in rupees" className="bg-slate-800 p-1.5 rounded w-24" value={d.amount} onChange={e=>set({amount:num(e.target.value,0,100000)})}/>
    Day<input type="number" aria-label="Day of purchase" className="bg-slate-800 p-1.5 rounded w-16" min={ledger.today} max={ledger.endDay} value={d.day} onChange={e=>set({day:num(e.target.value,ledger.today,ledger.endDay)})}/></div>
   {!valid&&<p role="alert" className="text-rose-400 text-sm">Enter an amount above ₹0 and within your cash balance ({inr(ledger.cash)}), on a day between {ledger.today} and {ledger.endDay}.</p>}
   {valid&&<p className="text-sm bg-slate-800 rounded-lg p-2">🧮 Reality Translator: {inr(d.amount)} ≈ {tr.swiggy} Swiggy orders ≈ {tr.allowanceDays} days of allowance ≈ {tr.goalPct}% of your savings goal.</p>}
  </Card>

  {valid&&<>
  <Card id="futures" title="Three Futures">
   <p className="text-xs text-slate-400">Risk rule: 🟢 lowest free cash ≥ 2× buffer ({inr(2*ledger.buffer)}) · 🟡 between buffer and 2× buffer · 🔴 below buffer, bill unpayable, or free cash negative (touching savings). In a plain cash model, buying now and waiting end the same unless income, price or a bill falls in between; waiting keeps Days {ledger.today}–{d.day+6} safer, and its real power is the Regret Check.</p>
   <Suspense fallback={<p>Loading chart…</p>}><Timeline data={data} buffer={ledger.buffer}/></Suspense>
   <div className="grid md:grid-cols-3 gap-2">{arr.map((r,i)=><button key={i} aria-pressed={tab===i} onClick={()=>setTab(i)} className={`text-left p-3 rounded-xl bg-slate-800 ${tab===i?'ring-2 ring-indigo-400':''}`}>
     <b>{names[i]}</b><div>{BADGE[r.risk]} · health {r.health}</div><div className="text-sm">Lowest {inr(r.lowest.freeCash)} (Day {r.lowest.day})</div><div className="text-xs text-slate-400">{reason(r)}</div></button>)}</div>
   <ConsequenceChain purchase={inr(d.amount)} balance={inr(sel.forecast)} allowance={inr(sel.allowance)+'/day'} goal={sel.lowest.freeCash<0?'underfunded':'safe'}/>
  </Card>

  <Card id="stress" title="Stress Test (what-if, not a prediction)">
   <div className="flex flex-wrap gap-2">{PACKS.map(p=><button key={p.id} className={`${btn} ${sb.packIds.includes(p.id)?'ring-2 ring-white':''}`} onClick={()=>sb.set({packIds:[...sb.packIds,p.id]})}>{p.name}{sb.packIds.filter(x=>x===p.id).length>0?` ×${sb.packIds.filter(x=>x===p.id).length}`:''}</button>)}<button className={btn} onClick={()=>sb.set({packIds:[]})}>Clear</button></div>
   <div className="text-sm">Custom shock ₹<input type="number" className="bg-slate-800 p-1 rounded w-20" aria-label="Custom shock amount" value={sb.customAmt} onChange={e=>sb.set({customAmt:num(e.target.value,0,100000)})}/> on Day <input type="number" className="bg-slate-800 p-1 rounded w-14" aria-label="Custom shock day" value={sb.customDay} onChange={e=>sb.set({customDay:num(e.target.value,ledger.today,ledger.endDay)})}/></div>
   {dup&&<p className="text-amber-300 text-sm">⚠️ The same shock was added twice. Allowed, but your month takes the hit twice.</p>}<p className="text-sm">Risk heatmap for <b>{names[tab]}</b> (✱ = bill / event / purchase day)</p>
   <Heatmap days={sel.days} marked={mark(sel)} inr={inr}/>
  </Card>

  <Card id="fix" title="Breaking Point & Smart Fix">
   <p>Max safe purchase on Day {d.day}: <b>{inr(safe)}</b> {picked.length?`(with ${picked.map(p=>p.name).join(' + ')})`:''}</p>
   <input type="range" aria-label="Purchase amount slider" className="w-full" min={0} max={5000} step={10} value={d.amount} onChange={e=>set({amount:num(e.target.value,0,100000)})}/>
   <p className="text-sm">At {inr(d.amount)}: {BADGE[arr[0].risk]}, lowest {inr(arr[0].lowest.freeCash)}</p>
   {fixes.length===0?<p className="text-sm text-emerald-400">{arr[0].risk==='red'?'No single proven fix found.':'No fix needed — this purchase passes.'}</p>:
    fixes.map((x,i)=><div key={i} className="flex justify-between items-center bg-slate-800 rounded-lg p-2 text-sm">{x.label} — month survives ✔<button className={btn} onClick={()=>{if(x.twin===ledger||x.kind==='price'||x.kind==='delay')set(x.decision);else done(commit(x.twin,x.decision),x.decision,`Fix applied: ${x.label}`)}}>{x.kind==='cancel'||x.kind==='trim'?'Apply & commit':'Use this'}</button></div>)}
  </Card>

  <Card id="letter" title="Future You Letter & Regret Check">
   <p className="italic" aria-live="polite">“{LEAD[pers]}{letter(sel)} {SIGN[pers]}” — Future You ({names[tab]})</p>
   {!regret?<button className={btn} onClick={()=>setRegret(true)}>Ready to decide</button>:<div className="space-y-2">
    <p>🤔 Still want it in 7 days?  Feeling:{['😍','😐','😬'].map(e=><button key={e} aria-pressed={mood===e} aria-label={`Feeling ${e}`} className={`mx-1 ${mood===e?'ring-2 ring-white rounded':''}`} onClick={()=>setMood(e)}>{e}</button>)}</p>
    <p className="text-sm text-amber-300">{warn(pers,arr[0])} {reason(arr[0])}</p>
    <div className="flex flex-wrap gap-2">
     <button className={btn} onClick={()=>done(commit(ledger,d),d,`Bought ${inr(d.amount)} on Day ${d.day}. Lowest ${inr(arr[0].lowest.freeCash)}. ${BADGE[arr[0].risk]}`)}>Confirm & commit (buy now)</button>
     <button className={btn} onClick={()=>{park(d);setRegret(false)}}>Park on cooling-off list</button>
     <button className={btn} onClick={()=>{log({label:`Skipped ${d.kind}`,mood,amount:d.amount,avoided:true});setCard(`Skipped ${inr(d.amount)}. Day-30 free cash ${inr(f.skip.forecast)}. ${BADGE[f.skip.risk]}`);setRegret(false)}}>Skip it</button></div></div>}
  </Card></>}

  {card&&<FutureCard text={card} onClose={()=>setCard('')}/>}

  <Card id="journal" title="Decision Journal & Settings">
   <p className="text-sm">Impulse buys avoided: {avoided.length} · {inr(avoided.reduce((s,j)=>s+j.amount,0))} not spent</p>
   <ul className="text-sm">{journal.map(j=><li key={j.id}>{j.mood} {j.label}{j.avoided?' (avoided)':''}</li>)}</ul>
   <p className="text-sm">Cooling-off list: {parked.length?parked.map(p=>`${p.kind} ${inr(p.amount)}`).join(', '):'empty'}</p>
   <div className="flex flex-wrap gap-3 text-sm items-center">
    Buffer ₹<input type="number" className="bg-slate-800 p-1 rounded w-20" aria-label="Safety buffer" value={ledger.buffer} onChange={e=>setLedger({...ledger,buffer:num(e.target.value,1,100000)})}/>
    Planned/day ₹<input type="number" className="bg-slate-800 p-1 rounded w-20" aria-label="Planned daily spend" value={ledger.plannedDailySpend} onChange={e=>setLedger({...ledger,plannedDailySpend:num(e.target.value,0,100000)})}/>
    <button className="px-3 py-1.5 rounded-lg bg-rose-600 text-sm" onClick={()=>{reset();sb.set({decision:{kind:'buy',amount:2000,day:6},packIds:[],customAmt:0});setCard('');setRegret(false)}}>Reset demo</button></div>
  </Card>
 </div></Ctx.Provider>}
