import {useCallback, useEffect, useState} from 'react'

export const ROUTES = ['home', 'decide', 'stress', 'plan', 'journal'] as const
export type Route = (typeof ROUTES)[number]

const read = (): Route => {
  const h = window.location.hash.replace(/^#\/?/, '')
  return (ROUTES as readonly string[]).includes(h) ? (h as Route) : 'home'
}

/** Tiny hash router: deep-linkable, works with the back button, no dependency. */
export function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((r: Route) => {
    window.location.hash = `/${r}`
  }, [])
  return [route, go]
}
