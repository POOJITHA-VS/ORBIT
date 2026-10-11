import {useEffect, useId, useState, type ButtonHTMLAttributes, type ReactNode} from 'react'
import type {Risk} from '../engine'
import {RISK, toNumber} from '../lib/format'

export function Card({
  title,
  hint,
  action,
  children,
  className = '',
}: {
  title: string
  hint?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <section className={`card ${className}`} aria-labelledby={id}>
      <header className="card-head">
        <div>
          <h2 id={id}>{title}</h2>
          {hint && <p className="hint">{hint}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

export function PageHeader({title, lead}: {title: string; lead: string}) {
  return (
    <div className="page-head">
      <h1 tabIndex={-1} data-page-title>
        {title}
      </h1>
      <p>{lead}</p>
    </div>
  )
}

export function Stat({label, value, tone}: {label: string; value: ReactNode; tone?: Risk}) {
  return (
    <div className={`stat ${tone ? `tone-${tone}` : ''}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function RiskBadge({risk}: {risk: Risk}) {
  const r = RISK[risk]
  return (
    <span className={`badge tone-${risk}`}>
      <span aria-hidden="true">{r.glyph}</span> {r.label}
    </span>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary' | 'ghost' | 'danger'}
export function Button({variant = 'primary', className = '', type = 'button', ...rest}: BtnProps) {
  return <button type={type} className={`btn btn-${variant} ${className}`} {...rest} />
}

/** Number input that lets people clear the box while typing and never produces NaN. */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  error,
  hint,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  error?: string
  hint?: string
}) {
  const id = useId()
  const [text, setText] = useState(String(value))
  useEffect(() => {
    setText((t) => (toNumber(t) === value ? t : String(value)))
  }, [value])
  const describedBy = [error ? `${id}-err` : '', hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        {prefix && <span aria-hidden="true">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            setText(e.target.value)
            onChange(toNumber(e.target.value))
          }}
        />
      </div>
      {hint && (
        <small id={`${id}-hint`} className="hint">
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-err`} className="error">
          {error}
        </small>
      )}
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 40,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  maxLength?: number
}) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input id={id} type="text" value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  )
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: readonly (readonly [T, string])[]
}) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function Meter({value, max, label, tone}: {value: number; max: number; label: string; tone?: Risk}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div
      className={`meter ${tone ? `tone-${tone}` : ''}`}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.max(0, Math.min(max, value))}
    >
      <span style={{width: `${pct}%`}} />
    </div>
  )
}

export function Empty({children}: {children: ReactNode}) {
  return <p className="empty">{children}</p>
}
