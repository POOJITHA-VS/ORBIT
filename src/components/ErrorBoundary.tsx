import {Component,type ReactNode} from 'react'
export default class ErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false}
 static getDerivedStateFromError(){return{failed:true}}
 reset=()=>{try{localStorage.removeItem('orbit-ledger2');localStorage.removeItem('orbit-sandbox2')}catch{/* storage unavailable */}location.reload()}
 render(){return this.state.failed
  ?<div role="alert" className="p-6 text-white"><h1 className="text-xl font-bold">Something went wrong.</h1><p>Your saved data may be corrupted.</p><button className="mt-3 px-3 py-2 rounded bg-indigo-600" onClick={this.reset}>Reset and reload</button></div>
  :this.props.children}}
