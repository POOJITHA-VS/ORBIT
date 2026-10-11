export default function GoalRing({reserved,target}:{reserved:number;target:number}){
 const pct=target>0?Math.max(0,Math.min(100,Math.round(reserved/target*100))):0,r=26,c=2*Math.PI*r
 return <svg width="72" height="72" viewBox="0 0 72 72" role="img" aria-label={`Savings goal ${pct}% funded`}>
  <circle cx="36" cy="36" r={r} fill="none" stroke="#334155" strokeWidth="8"/>
  <circle cx="36" cy="36" r={r} fill="none" stroke="#34d399" strokeWidth="8" strokeDasharray={`${c*pct/100} ${c}`} transform="rotate(-90 36 36)"/>
  <text x="36" y="40" textAnchor="middle" fontSize="13" fill="#fff">{pct}%</text></svg>}
