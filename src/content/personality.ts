import type {Result} from '../engine'
export const TYPES=['Impulse Panda','Planner Owl','Social Butterfly','Subscription Hoarder','Silent Saver']
export const QUIZ:{q:string;a:[string,string][]}[]=[
 {q:'A friend says "just get it, it is on sale!"',a:[['I buy it right away','Impulse Panda'],['I check my budget first','Planner Owl'],['I ask who else is getting it','Social Butterfly'],['I keep the money saved','Silent Saver']]},
 {q:'Your phone shows a free-trial offer',a:[['Sign up, cancel never','Subscription Hoarder'],['Skip it','Silent Saver'],['Only if friends use it','Social Butterfly'],['Put a reminder to cancel','Planner Owl']]},
 {q:'You get unexpected money',a:[['Treat myself today','Impulse Panda'],['Split it into a plan','Planner Owl'],['Take everyone out','Social Butterfly'],['Straight to savings','Silent Saver']]},
 {q:'Which app do you open most?',a:[['Shopping apps','Impulse Panda'],['Streaming and music','Subscription Hoarder'],['Group chats and maps','Social Butterfly'],['Notes and budget sheets','Planner Owl']]},
 {q:'End of month, you usually…',a:[['Wonder where it went','Impulse Panda'],['Find 5 forgotten subscriptions','Subscription Hoarder'],['Have bills for outings','Social Butterfly'],['Still have most of it','Silent Saver']]}]
export const pick=(answers:string[])=>{const c:Record<string,number>={};answers.forEach(a=>c[a]=(c[a]||0)+1)
  return TYPES.reduce((b,t)=>(c[t]||0)>(c[b]||0)?t:b,TYPES[1])}
export const LEAD:Record<string,string>={'Impulse Panda':'Pause for a breath. ','Planner Owl':'Plan check. ','Social Butterfly':'Outings add up fast. ','Subscription Hoarder':'Check your subscriptions first. ','Silent Saver':'Your goal comes first. '}
export const SIGN:Record<string,string>={'Impulse Panda':'— Future You, still glad you slept on it','Planner Owl':'— Future You, reading the spreadsheet','Social Butterfly':'— Future You, happy to hang out within budget','Subscription Hoarder':'— Future You, scanning my bank statement','Silent Saver':'— Future You, quietly proud'}
// personality decides which risk is flagged first
export function warn(p:string,r:Result):string{
  const low=`Lowest point ₹${r.lowest.freeCash} on Day ${r.lowest.day}.`
  if(p==='Planner Owl')return r.breachDay?`First problem: buffer breach on Day ${r.breachDay}. ${low}`:low
  if(p==='Silent Saver')return r.shortfallDay?`Your savings goal gets touched from Day ${r.shortfallDay}.`:'Your savings goal stays safe.'
  if(p==='Subscription Hoarder')return `Every subscription still renews. ${low}`
  if(p==='Social Butterfly')return `Social spending is the first thing to squeeze. ${low}`
  return `This one hits right now. ${low}`
}
