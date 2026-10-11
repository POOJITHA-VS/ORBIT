import {createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode} from 'react'

const NoticeCtx = createContext<(msg: string) => void>(() => {})
export const useNotice = () => useContext(NoticeCtx)

/** One polite live region + a visible toast, so every committed action is announced to screen readers too. */
export function NoticeProvider({children}: {children: ReactNode}) {
  const [msg, setMsg] = useState('')
  const timer = useRef<number>()
  const notify = useCallback((m: string) => {
    setMsg(m)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(''), 4500)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <NoticeCtx.Provider value={notify}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
        {msg && <p className="toast">{msg}</p>}
      </div>
    </NoticeCtx.Provider>
  )
}
