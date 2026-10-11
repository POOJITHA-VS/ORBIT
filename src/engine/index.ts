// Pure engine: no UI, no side effects. Simulations run on clones only.
export type EventKind='expense'|'income'|'bill'|'subscription'|'shock'
export type Event={id:string;day:number;amount:number;kind:EventKind;label:string;category?:string}
export type Goal={id:string;name:string;target:number;reserved:number}
export type Twin={today:number;endDay:number;cash:number;goals:Goal[];events:Event[];plannedDailySpend:number;buffer:number}
export type Decision={kind:'buy'|'save'|'subscribe'|'emergency';amount:number;day:number;recurring?:boolean}
export type Risk='green'|'yellow'|'red'
export type DayState={day:number;cash:number;freeCash:number;events:Event[];risk:Risk}
export type Result={days:DayState[];lowest:{day:number;freeCash:number};breachDay?:number;shortfallDay?:number;unpayable:boolean;risk:Risk;health:number;allowance:number;forecast:number}
export type Fix={kind:'price'|'delay'|'cancel'|'trim';label:string;decision:Decision;twin:Twin}

const clone=<T,>(x:T):T=>JSON.parse(JSON.stringify(x))
const reservedOf=(t:Twin)=>t.goals.reduce((s,g)=>s+g.reserved,0)
const level=(free:number,b:number):Risk=>free<b?'red':free<2*b?'yellow':'green'
const dEvent=(d:Decision,id:string):Event=>({id,day:d.day,amount:d.amount,
  kind:d.kind==='subscribe'?'subscription':'expense',label:d.kind==='save'?'Move to goal':d.kind,
  category:d.kind==='save'?'transfer':d.kind})

export function riskLevel(r:Result,buffer:number):Risk{
  if(r.unpayable||r.lowest.freeCash<0||r.lowest.freeCash<buffer)return'red'
  return level(r.lowest.freeCash,buffer)
}
export function healthScore(r:Result,t:Twin):number{
  const b=t.buffer,res=reservedOf(t),low=r.lowest.freeCash
  const buf=30*Math.min(Math.max(low/(2*b),0),1)
  const bills=r.unpayable?0:25
  const goal=res>0?25*Math.max(0,1-Math.max(0,-low)/res):25
  const pace=t.plannedDailySpend>0?20*Math.min(r.allowance/t.plannedDailySpend,1):20
  return Math.round(buf+bills+goal+pace)
}
export function simulate(twin:Twin,decisions:Decision[],shocks:Event[]=[]):Result{
  const t=clone(twin)
  const evs:Event[]=t.events.filter(e=>e.day>=t.today&&e.day<=t.endDay)
  decisions.forEach((d,i)=>{if(d.day>=t.today&&d.day<=t.endDay)evs.push(dEvent(d,'dec'+i))})
  shocks.forEach(s=>{if(s.day>=t.today&&s.day<=t.endDay)evs.push(clone(s))})
  for(let d=t.today;d<=t.endDay;d++)if(t.plannedDailySpend>0)
    evs.push({id:'plan'+d,day:d,amount:t.plannedDailySpend,kind:'expense',label:'Planned spend',category:'planned'})
  evs.sort((a,b)=>a.day-b.day)            // stable: strictly by date
  let cash=t.cash,reserved=reservedOf(t),unpayable=false
  const days:DayState[]=[];let lowest={day:t.today,freeCash:Infinity};let breachDay:number|undefined,shortfallDay:number|undefined
  for(let d=t.today;d<=t.endDay;d++){
    const todays=evs.filter(e=>e.day===d)
    for(const e of todays){
      if(e.category==='transfer')reserved+=e.amount
      else if(e.kind==='income')cash+=e.amount
      else{cash-=e.amount;if((e.kind==='bill'||e.kind==='subscription')&&cash<0)unpayable=true}
    }
    const free=cash-reserved
    days.push({day:d,cash,freeCash:free,events:todays,risk:level(free,t.buffer)})
    if(free<lowest.freeCash)lowest={day:d,freeCash:free}
    if(breachDay===undefined&&free<t.buffer)breachDay=d
    if(shortfallDay===undefined&&free<0)shortfallDay=d
  }
  const n=t.endDay-t.today+1,forecast=days[days.length-1].freeCash
  const allowance=Math.max(0,Math.round((forecast+t.plannedDailySpend*n-t.buffer)/n))
  const r:Result={days,lowest,breachDay,shortfallDay,unpayable,risk:'green',health:0,allowance,forecast}
  r.risk=riskLevel(r,t.buffer);r.health=healthScore(r,t);return r
}
export function branch(twin:Twin,d:Decision,shocks:Event[]=[]){
  return{buyNow:simulate(twin,[d],shocks),wait7:simulate(twin,[{...d,day:d.day+7}],shocks),skip:simulate(twin,[],shocks)}
}
export function stressTest(twin:Twin,d:Decision,pack:{events:Event[]}):Result[]{
  const b=branch(twin,d,pack.events);return[b.buyNow,b.wait7,b.skip]
}
const passes=(r:Result)=>r.risk!=='red'
export function maxSafePurchase(twin:Twin,shocks:Event[]=[],day=twin.today,kind:Decision['kind']='buy'):number{
  let lo=0,hi=500 // ₹10 steps over ₹0–₹5,000; larger purchase only lowers free cash => monotonic
  while(lo<hi){const mid=Math.ceil((lo+hi)/2)
    if(passes(simulate(twin,[{kind,amount:mid*10,day}],shocks)))lo=mid;else hi=mid-1}
  return lo*10
}
export function smartFix(twin:Twin,d:Decision,shocks:Event[]=[]):Fix[]{
  const ok=(t:Twin,x:Decision)=>passes(simulate(t,[x],shocks))
  if(ok(twin,d))return[]
  const out:Fix[]=[]
  const m=maxSafePurchase(twin,shocks,d.day,d.kind)            // 1. smaller price
  if(m>0&&m<d.amount)out.push({kind:'price',label:`Cut the purchase to ₹${m}`,decision:{...d,amount:m},twin})
  for(let day=d.day+1;day<=twin.endDay;day++)                    // 2. later date
    if(ok(twin,{...d,day})){out.push({kind:'delay',label:`Delay it to Day ${day}`,decision:{...d,day},twin});break}
  const subs=twin.events.filter(e=>e.kind==='subscription'&&e.day>=twin.today)
  const trimmed=(t:Twin,x:number)=>({...clone(t),plannedDailySpend:t.plannedDailySpend-x})
  for(const s of subs){                                          // 3. cancel subscription
    const t2={...clone(twin),events:twin.events.filter(e=>e.id!==s.id)}
    if(ok(t2,d))out.push({kind:'cancel',label:`Cancel ${s.label} (saves ₹${s.amount})`,decision:d,twin:t2})
  }
  for(let x=5;x<=twin.plannedDailySpend;x+=5){                   // 4. trim daily spend
    const t2=trimmed(twin,x)
    if(ok(t2,d)){out.push({kind:'trim',label:`Trim planned spend by ₹${x}/day`,decision:d,twin:t2});break}
  }
  for(const s of subs){                                          // 3+4 combined
    const base={...clone(twin),events:twin.events.filter(e=>e.id!==s.id)}
    if(ok(base,d))continue
    for(let x=5;x<=twin.plannedDailySpend;x+=5){const t2=trimmed(base,x)
      if(ok(t2,d)){out.push({kind:'cancel',label:`Cancel ${s.label} and trim ₹${x}/day`,decision:d,twin:t2});break}}
  }
  return out
}
// The ONLY function that returns a changed real ledger.
export function commit(twin:Twin,d:Decision):Twin{
  const t=clone(twin),e=dEvent(d,`c${t.events.length}-${d.day}`)
  if(d.day<=t.today){ if(e.category==='transfer')t.goals[0].reserved+=d.amount; else t.cash-=d.amount }
  else t.events.push(e)
  return t
}
export function metrics(t:Twin){
  const days=t.endDay-t.today+1,free=t.cash-reservedOf(t)
  const up=t.events.filter(e=>e.day>=t.today)
  const income=up.filter(e=>e.kind==='income').reduce((s,e)=>s+e.amount,0)
  const due=up.filter(e=>e.kind!=='income').reduce((s,e)=>s+e.amount,0)
  const safe=free+income-due
  return{days,free,safe,allowance:Math.round((safe-t.buffer)/days),survival:t.plannedDailySpend?Math.floor(free/t.plannedDailySpend):0,reserved:reservedOf(t)}
}
export function translate(amount:number,t:Twin){
  const m=metrics(t),res=reservedOf(t)
  return{swiggy:Math.round(amount/330),allowanceDays:m.allowance>0?Math.round(amount/m.allowance):0,goalPct:res?Math.round(amount/res*100):0}
}
