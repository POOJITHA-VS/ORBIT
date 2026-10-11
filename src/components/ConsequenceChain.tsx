export default function ConsequenceChain({purchase,balance,allowance,goal}:{purchase:string;balance:string;allowance:string;goal:string}){
 const steps=[['Purchase',purchase],['Day-30 balance',balance],['Allowance',allowance],['Goal',goal]]
 return <ol className="flex flex-wrap items-center gap-1 text-sm list-none p-0" aria-label="Consequence chain">{steps.map(([k,v],i)=>
  <li key={k} className="flex items-center gap-1"><span className="bg-slate-800 rounded-lg px-2 py-1"><span className="text-slate-400">{k}: </span><b>{v}</b></span>{i<3&&<span aria-hidden="true">→</span>}</li>)}</ol>}
