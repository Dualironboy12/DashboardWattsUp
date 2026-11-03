import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`.trim()}>{children}</section>
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'danger' | 'berry' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

export function RangeValue({ label, values, unit = '', emphasis = false }: { label: string; values: [string, string, string]; unit?: string; emphasis?: boolean }) {
  return (
    <div className={`range-value ${emphasis ? 'range-emphasis' : ''}`}>
      <div className="metric-label">{label}</div>
      <div className="range-main">
        {values[1]} {unit ? <small>{unit}</small> : null}
      </div>
      <div className="range-track" aria-hidden="true">
        <span />
        <i />
      </div>
      <div className="range-labels">
        <span>P10 {values[0]}</span>
        <strong>P50 {values[1]}</strong>
        <span>P90 {values[2]}</span>
      </div>
    </div>
  )
}
