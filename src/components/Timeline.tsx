import {LineChart,Line,XAxis,YAxis,Tooltip,Legend,ResponsiveContainer,ReferenceLine} from 'recharts'
export type Point={day:number;A:number;B:number;C:number}
export default function Timeline({data,buffer}:{data:Point[];buffer:number}){
 return <div style={{height:260}} role="img" aria-label="Line chart of free cash from today to Day 30 for the three futures: buy now, wait 7 days, skip">
  <ResponsiveContainer><LineChart data={data}><XAxis dataKey="day"/><YAxis/><Tooltip/><Legend/>
   <ReferenceLine y={buffer} stroke="#f43f5e" strokeDasharray="4 4" label="buffer"/><ReferenceLine y={0} stroke="#64748b"/>
   <Line dataKey="A" name="A Buy now" stroke="#f97316" dot={false}/><Line dataKey="B" name="B Wait 7" stroke="#38bdf8" dot={false}/><Line dataKey="C" name="C Skip" stroke="#34d399" dot={false}/></LineChart></ResponsiveContainer></div>}
