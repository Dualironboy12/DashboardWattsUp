import { useMemo, useState } from 'react'
import { Icon } from '@/components/Icon'
import { Card, Pill } from '@/components/ui'
import { BASE_ASSUMPTIONS, PILOT, formatMoney, formatPercent, formatYears, projectFund, type Assumptions, type Band } from '@/model/piloto'

type SavedScenario = { id: number; assumptions: Assumptions }

export function FundScreen({ assumptions, onChange }: { assumptions: Assumptions; onChange: (next: Assumptions) => void }) {
  const projection = useMemo(() => projectFund(assumptions), [assumptions])
  const [tab, setTab] = useState<'projection' | 'compare'>('projection')
  const [saved, setSaved] = useState<SavedScenario[]>([])
  const [nextId, setNextId] = useState(1)

  function update(partial: Partial<Assumptions>) {
    onChange({ ...assumptions, ...partial })
  }

  function saveScenario() {
    if (saved.length >= 3) return
    setSaved(current => [...current, { id: nextId, assumptions }])
    setNextId(current => current + 1)
    setTab('compare')
  }

  return (
    <div className="fund-layout">
      <Card className="controls-card">
        <div className="section-title">
          <div>
            <span className="eyebrow">Supuestos</span>
            <h2>Ajusta el escenario</h2>
          </div>
          <button type="button" className="text-button" onClick={() => onChange(BASE_ASSUMPTIONS)}>
            Restablecer
          </button>
        </div>
        <Slider label="Valor del kWh" min={0.5} max={3} step={0.05} value={assumptions.price} display={formatMoney(assumptions.price)} onChange={value => update({ price: value })} ends={['$0.50', '$3.00']} />
        <Slider label="Morosidad" min={0} max={40} step={1} value={assumptions.delinquency * 100} display={formatPercent(assumptions.delinquency, 0)} onChange={value => update({ delinquency: value / 100 })} ends={['0%', '40%']} />
        <Slider label="Degradación anual" min={0} max={3} step={0.1} value={assumptions.degradation * 100} display={formatPercent(assumptions.degradation, 1)} onChange={value => update({ degradation: value / 100 })} ends={['0%', '3%']} />
        <Slider label="Fallas de equipo" min={0} max={30} step={1} value={assumptions.failures * 100} display={formatPercent(assumptions.failures, 0)} onChange={value => update({ failures: value / 100 })} ends={['0%', '30%']} />
        <Slider label="Costo financiero pactado" min={0} max={12} step={0.5} value={assumptions.financialCost * 100} display={formatPercent(assumptions.financialCost, 1)} onChange={value => update({ financialCost: value / 100 })} ends={['0%', '12%']} />
        <label className="toggle-row">
          <div>
            <strong>Primer año sin ingresos</strong>
            <span>El primer año es de instalación</span>
          </div>
          <input type="checkbox" checked={assumptions.firstYearIdle} onChange={event => update({ firstYearIdle: event.target.checked })} />
          <i />
        </label>
        <div className="assumption-note">
          <Icon name="info" size={17} />
          <span>El escenario inicial es el de la ficha: {formatMoney(PILOT.kwhPrice)}/kWh, sin morosidad, sin fallas y sin costo financiero.</span>
        </div>
      </Card>

      <div className="fund-results">
        {!projection.coversOperation ? (
          <div className="scenario-alert" role="alert">
            <Icon name="alert" />
            <div>
              <strong>Este escenario no cubre la operación</strong>
              <span>{assumptions.price < 0.74 && assumptions.delinquency === 0 && assumptions.failures === 0 && assumptions.financialCost === 0 ? 'Con este valor del kWh la cooperativa no cubre su mantenimiento.' : 'Con estos supuestos la cooperativa no cubre su mantenimiento.'}</span>
            </div>
          </div>
        ) : null}
        <div className="kpi-grid result-kpis">
          <Card>
            <span>Casas nuevas en 5 años</span>
            <strong>{projection.newHomesIn5.p50}</strong>
            <p>
              {!projection.coversOperation
                ? 'No queda excedente: la cuota no alcanza para la operación.'
                : projection.newHomesIn5.p50 === 0
                  ? 'Primero se devuelve el capital. El fondo todavía no instala casas.'
                  : `Rango P10 ${projection.newHomesIn5.p10} · P50 ${projection.newHomesIn5.p50} · P90 ${projection.newHomesIn5.p90}`}
            </p>
          </Card>
          <Card>
            <span>Devolución del 100% al financiador</span>
            <strong>{formatYears(projection.paybackYears)}</strong>
            <p>TIR a 20 años: {projection.irr === null ? 'no aplica' : formatPercent(projection.irr)}. Recuperación simple.</p>
          </Card>
          <Card>
            <span>Probabilidad de cubrir operación</span>
            <strong>{formatPercent(projection.coverProbability, 0)}</strong>
            <p>{projection.coverProbability >= 0.9 ? 'También cubre en el escenario bajo' : projection.coverProbability >= 0.5 ? 'Cubre en el escenario mediano' : 'En el escenario bajo no alcanza'}</p>
          </Card>
        </div>

        <Card className="fan-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Proyección a 10 años</span>
              <h2>{tab === 'projection' ? 'Viviendas de la cooperativa' : 'Comparar escenarios'}</h2>
            </div>
            <div className="tabs" role="tablist">
              <button type="button" className={tab === 'projection' ? 'active' : ''} onClick={() => setTab('projection')}>
                Proyección
              </button>
              <button type="button" className={tab === 'compare' ? 'active' : ''} onClick={() => setTab('compare')}>
                Comparar escenarios
              </button>
            </div>
          </div>

          {tab === 'projection' ? (
            <>
              <FanChart series={projection.homesByYear} />
              <div className="chart-caption">
                <div className="legend">
                  <span>
                    <i className="fan-key" /> Banda P10—P90
                  </span>
                  <span>
                    <i className="line-key" /> Línea P50
                  </span>
                </div>
                <span>
                  {projection.homesAtYear10 > PILOT.homes
                    ? `Al año 10 hay ${projection.homesAtYear10} viviendas en el escenario mediano. En los primeros 5 años no se instala ninguna casa nueva.`
                    : 'Al año 10 el escenario mediano sigue sin sumar viviendas al piloto.'}
                </span>
              </div>
            </>
          ) : (
            <div className="compare-panel">
              <div className="compare-actions">
                <button type="button" className="primary-button" onClick={saveScenario} disabled={saved.length >= 3}>
                  Guardar escenario actual
                </button>
                <p>{saved.length >= 3 ? 'Puedes comparar hasta 3 escenarios. Quita uno para guardar otro.' : 'Guarda la combinación de supuestos que estás viendo. Máximo 3.'}</p>
              </div>
              {saved.length === 0 ? <p className="empty-note">Todavía no hay escenarios guardados.</p> : null}
              <div className="compare-grid">
                {saved.map(scenario => {
                  const result = projectFund(scenario.assumptions)
                  return (
                    <article key={scenario.id} className="scenario-card">
                      <div className="section-title">
                        <h2>
                          Escenario {scenario.id} · {formatMoney(scenario.assumptions.price)}/kWh
                        </h2>
                        <button type="button" className="text-button" onClick={() => setSaved(current => current.filter(item => item.id !== scenario.id))}>
                          Quitar
                        </button>
                      </div>
                      <p>Recuperación: {formatYears(result.paybackYears)}</p>
                      <p>Casas nuevas en 5 años: {result.newHomesIn5.p50}</p>
                      <p>Cubre la operación: {formatPercent(result.coverProbability, 0)}</p>
                      <p>TIR a 20 años: {result.irr === null ? 'no aplica' : formatPercent(result.irr)}</p>
                      <p className="muted">
                        Morosidad {formatPercent(scenario.assumptions.delinquency, 0)} · Degradación {formatPercent(scenario.assumptions.degradation, 1)} · Fallas {formatPercent(scenario.assumptions.failures, 0)} · Costo financiero {formatPercent(scenario.assumptions.financialCost, 1)}
                        {scenario.assumptions.firstYearIdle ? ' · Primer año sin ingresos' : ''}
                      </p>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="section-title">
            <div>
              <h2>Capital devuelto a financiadores</h2>
              <p>Porcentaje del capital del piloto, escenario mediano</p>
            </div>
            <Pill tone="good">{formatPercent(projection.repaidFractionByYear.at(-1) ?? 0, 0)} proyectado a 10 años</Pill>
          </div>
          <div className="capital-bars">
            {projection.repaidFractionByYear.map((fraction, index) => (
              <div key={index}>
                <i style={{ height: `${fraction * 100}%` }} />
                <span>{index + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Slider({ label, min, max, step, value, display, ends, onChange }: { label: string; min: number; max: number; step: number; value: number; display: string; ends: [string, string]; onChange: (value: number) => void }) {
  const id = label.replace(/\s+/g, '-').toLowerCase()
  return (
    <div className="control-group">
      <div>
        <label htmlFor={id}>{label}</label>
        <strong>{display}</strong>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} />
      <div className="range-ends">
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  )
}

function FanChart({ series }: { series: Record<Band, number[]> }) {
  const left = 48
  const right = 790
  const top = 36
  const bottom = 250
  const maxHomes = Math.max(16, ...series.p10, ...series.p50, ...series.p90)
  const x = (index: number) => left + (index * (right - left)) / 9
  const y = (homes: number) => bottom - (homes / maxHomes) * (bottom - top)
  const line = (values: number[]) => values.map((homes, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)} ${y(homes).toFixed(1)}`).join(' ')
  const band = `${line(series.p90)} ${[...series.p10].reverse().map((homes, index) => `L${x(series.p10.length - 1 - index).toFixed(1)} ${y(homes).toFixed(1)}`).join(' ')} Z`

  return (
    <svg className="fan-chart" viewBox="0 0 820 300" role="img" aria-label="Proyección de viviendas de la cooperativa a 10 años">
      {[0, 0.25, 0.5, 0.75, 1].map(fraction => (
        <line key={fraction} x1={left} y1={y(maxHomes * fraction)} x2={right} y2={y(maxHomes * fraction)} className="gridline" />
      ))}
      <path d={band} className="fan-band" />
      <path d={line(series.p50)} className="fan-line" />
      {series.p50.map((_, index) => (
        <text key={index} x={x(index)} y="286" textAnchor="middle">
          {index + 1}
        </text>
      ))}
    </svg>
  )
}
