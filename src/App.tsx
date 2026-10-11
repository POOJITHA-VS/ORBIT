import {lazy, Suspense, useEffect, useRef} from 'react'
import Icon, {type IconName} from './components/Icon'
import {NoticeProvider} from './components/Notice'
import {useHashRoute, ROUTES, type Route} from './hooks/useHashRoute'
import {useTheme} from './hooks/useTheme'
import {useLedger} from './store'
import Onboarding from './pages/Onboarding'

// Each page is its own chunk, so the first paint only downloads what the current screen needs.
const PAGES: Record<Route, ReturnType<typeof lazy>> = {
  home: lazy(() => import('./pages/Home')),
  decide: lazy(() => import('./pages/Decide')),
  stress: lazy(() => import('./pages/Stress')),
  plan: lazy(() => import('./pages/Plan')),
  journal: lazy(() => import('./pages/Journal')),
}

const NAV: Record<Route, {label: string; icon: IconName}> = {
  home: {label: 'Home', icon: 'home'},
  decide: {label: 'Decide', icon: 'decide'},
  stress: {label: 'Stress', icon: 'stress'},
  plan: {label: 'Plan', icon: 'plan'},
  journal: {label: 'Journal', icon: 'journal'},
}

export default function App() {
  const {ledger, profile, setProfile, setLedger} = useLedger()
  const [route, go] = useHashRoute()
  const [theme, toggleTheme] = useTheme()
  const mainRef = useRef<HTMLElement>(null)
  const first = useRef(true)

  // Move focus to the new page title on navigation so keyboard and screen-reader users land in the right place.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo({top: 0})
    mainRef.current?.querySelector<HTMLElement>('[data-page-title]')?.focus({preventScroll: true})
  }, [route])

  if (!profile.onboarded)
    return (
      <>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Onboarding
          onDone={(p, b, g) => {
            setProfile({personality: p, onboarded: true})
            setLedger({...ledger, buffer: b, goals: [{...ledger.goals[0], target: g}, ...ledger.goals.slice(1)]})
          }}
        />
      </>
    )

  const Page = PAGES[route]
  return (
    <NoticeProvider>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <circle cx="16" cy="16" r="5" fill="var(--accent)" />
              <ellipse cx="16" cy="16" rx="13" ry="6" fill="none" stroke="var(--accent)" strokeWidth="2" transform="rotate(-25 16 16)" />
            </svg>
            <span>ORBIT</span>
          </div>
          <p className="tagline">What happens to my month if I do this?</p>
          <button className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
        </header>

        <nav className="nav" aria-label="Main">
          {ROUTES.map((r) => (
            <a key={r} href={`#/${r}`} aria-current={route === r ? 'page' : undefined} onClick={(e) => { e.preventDefault(); go(r) }}>
              <Icon name={NAV[r].icon} />
              <span>{NAV[r].label}</span>
            </a>
          ))}
        </nav>

        <main id="main" ref={mainRef} className="main">
          <Suspense fallback={<p className="loading" role="status">Loading…</p>}>
            <Page />
          </Suspense>
          <footer className="foot">Day {ledger.today} of {ledger.endDay} · Simulations run on a copy of your month. Your real ledger only changes when you confirm.</footer>
        </main>
      </div>
    </NoticeProvider>
  )
}
