import type {DayState} from '../engine'
const TILE={green:'bg-emerald-500',yellow:'bg-amber-400',red:'bg-rose-500'}
const NAME={green:'comfortable',yellow:'tight',red:'risky'}
export default function Heatmap({days,marked,inr}:{days:DayState[];marked:(d:number)=>boolean;inr:(n:number)=>string}){
 return <ul className="grid grid-cols-10 gap-1 list-none p-0" aria-label="Risk heatmap by day">{days.map(x=>
  <li key={x.day} title={`Day ${x.day}: ${inr(x.freeCash)}`} aria-label={`Day ${x.day}, free cash ${inr(x.freeCash)}, ${NAME[x.risk]}${marked(x.day)?', bill or event day':''}`}
   className={`${TILE[x.risk]} text-slate-900 text-xs rounded p-1 text-center`}>{x.day}{marked(x.day)?'✱':''}</li>)}</ul>}
