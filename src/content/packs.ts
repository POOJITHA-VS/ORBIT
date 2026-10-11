import type {Event} from '../engine'
const s=(id:string,day:number,amount:number,label:string):Event=>({id,day,amount,kind:'shock',label})
export const PACKS:{id:string;name:string;events:Event[]}[]=[
 {id:'exam',name:'Exam week ₹1,500',events:[s('x1',16,600,'Study material'),s('x2',17,500,'Late-night food'),s('x3',18,400,'Emergency cab')]},
 {id:'bday',name:"Friend's birthday ₹800",events:[s('f1',15,800,"Friend's birthday")]},
 {id:'trip',name:'Trip invite ₹1,500',events:[s('t1',22,1500,'Trip')]},
 {id:'phone',name:'Phone repair ₹1,200',events:[s('p1',18,1200,'Phone repair')]},
 {id:'fest',name:'Festival season ₹1,000',events:[s('s1',19,600,'Festival gifts'),s('s2',20,400,'Festival outing')]}]
