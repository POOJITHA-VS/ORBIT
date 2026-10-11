import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {MotionConfig} from 'framer-motion'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><MotionConfig reducedMotion="user">
 <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:p-2 focus:rounded">Skip to main content</a>
 <App/></MotionConfig></ErrorBoundary></StrictMode>)
