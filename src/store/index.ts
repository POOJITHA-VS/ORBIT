import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {seed} from '../engine/seed'
import type {Twin,Decision} from '../engine'
const isTwin=(t:any):t is Twin=>!!t&&typeof t.cash==='number'&&typeof t.buffer==='number'&&Array.isArray(t.events)&&Array.isArray(t.goals)&&t.goals.length>0
export type Entry={id:number;label:string;mood:string;amount:number;avoided:boolean}
type Profile={personality:string;onboarded:boolean}
type L={ledger:Twin;journal:Entry[];parked:Decision[];profile:Profile;setProfile:(p:Profile)=>void;setLedger:(t:Twin)=>void;log:(e:Omit<Entry,'id'>)=>void;park:(d:Decision)=>void;reset:()=>void}
export const useLedger=create<L>()(persist((set)=>({ledger:seed(),journal:[],parked:[],profile:{personality:'Planner Owl',onboarded:false},
 setProfile:profile=>set({profile}),setLedger:ledger=>set({ledger}),log:e=>set(s=>({journal:[{...e,id:Date.now()},...s.journal]})),
 park:d=>set(s=>({parked:[...s.parked,d]})),reset:()=>set({ledger:seed(),journal:[],parked:[]})}),{name:'orbit-ledger2',merge:(p:any,c)=>p&&isTwin(p.ledger)?{...c,...p}:c}))
type S={decision:Decision;packIds:string[];customAmt:number;customDay:number;set:(p:Partial<Omit<S,'set'>>)=>void}
export const useSandbox=create<S>()(persist((set)=>({decision:{kind:'buy',amount:2000,day:6},packIds:[],customAmt:0,customDay:20,
 set:p=>set(p)}),{name:'orbit-sandbox2'}))
