import {Component, type ErrorInfo, type ReactNode} from 'react'

type State = {failed: boolean}

/** Last line of defence: a render crash shows a recovery screen instead of a blank page. */
export default class ErrorBoundary extends Component<{children: ReactNode}, State> {
  state: State = {failed: false}
  static getDerivedStateFromError(): State {
    return {failed: true}
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ORBIT render error', error, info.componentStack)
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="crash" role="alert">
        <h1>Something broke in orbit</h1>
        <p>Your data is saved on this device. Reload to continue, or reset the demo if the problem comes back.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload ORBIT
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            localStorage.removeItem('orbit-ledger2')
            localStorage.removeItem('orbit-sandbox2')
            window.location.reload()
          }}
        >
          Reset saved data
        </button>
      </main>
    )
  }
}
