import type {Twin} from './index'
export const seed=():Twin=>({today:6,endDay:30,cash:8500,plannedDailySpend:100,buffer:1000,
  goals:[{id:'g1',name:'Savings goal',target:2000,reserved:2000}],
  events:[
   {id:'inc14',day:14,amount:1000,kind:'income',label:'Tutoring payout'},
   {id:'b9',day:9,amount:59,kind:'subscription',label:'Spotify'},
   {id:'b12',day:12,amount:1100,kind:'bill',label:'Mess fee'},
   {id:'b15',day:15,amount:149,kind:'subscription',label:'OTT'},
   {id:'b20',day:20,amount:299,kind:'bill',label:'Phone recharge'},
   {id:'b25',day:25,amount:393,kind:'bill',label:'Transport pass'}]})
export const spentSoFar={total:1500,food:650,transport:300,outings:350,stationery:200}
