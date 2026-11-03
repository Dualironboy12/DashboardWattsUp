import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { Card, Pill } from '@/components/ui'
import { HOMES, PILOT, creditKwh, formatMoney, formatNumber, formatPercent, hasDispute, measurementGap, periodSavings, verifySeries } from '@/model/piloto'

export function VerifyScreen() {
  const [homeId, setHomeId] = useState('casa-04')
  const [marked, setMarked] = useState(false)
  const home = HOMES.find(item => item.id === homeId) ?? HOMES[3]
  const series = verifySeries(home)
  const period = periodSavings(home)
  const dispute = hasDispute(home)
  const credit = creditKwh(home)
  const creditValue = credit * PILOT.kwhPrice

  return (
    <div className="content-column">
      <div className="verify-toolbar">
        <label>
          <span>Vivienda</span>
          <select value={home.id} onChange={event => { setHomeId(event.target.value); setMarked(false) }}>
            {HOMES.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <Pill tone={marked ? 'warn' : dispute ? 'danger' : 'good'}>{marked ? 'Marcada para revisión' : dispute ? 'Diferencia por revisar' : 'Datos al día'}</Pill>
      </div>

      <div className="verify-grid">
        <Card className="chart-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">Últimos 6 bimestres</span>
              <h2>Consumo y generación</h2>
              <p>kWh por periodo de facturación</p>
            </div>
            <div className="chart-legend">
              <span>
                <i className="line-base" /> Consumo base
              </span>
              <span>
                <i className="bar-actual" /> Recibo actual
              </span>
              <span>
                <i className="line-gen" /> Generación medida
              </span>
            </div>
          </div>
          <VerifyChart series={series} />
          <div className="chart-caption">
            <Pill>Rango P10—P90</Pill>
            <span>La banda es la generación esperada. La línea verde es lo que midió el microinversor.</span>
          </div>
        </Card>

        <Card className="calculation-card">
          <span className="eyebrow">Cálculo del periodo</span>
          <h2>Enero—Febrero 2025</h2>
          <div className="formula">
            <div>
              <span>Consumo base</span>
              <strong>{formatNumber(home.baselineKwh)} kWh</strong>
            </div>
            <b>−</b>
            <div>
              <span>Recibo actual</span>
              <strong>{formatNumber(home.currentBillKwh)} kWh</strong>
            </div>
            <b>=</b>
            <div className="formula-result">
              <span>Ahorro</span>
              <strong>{formatNumber(period.kwh)} kWh</strong>
            </div>
          </div>
          <div className="split">
            <div>
              <span>80% · Cooperativa</span>
              <strong>{formatMoney(period.quota)}</strong>
              <p>Cuota del bimestre</p>
            </div>
            <div>
              <span>20% · Hogar</span>
              <strong>{formatMoney(period.household)}</strong>
              <p>Ahorro que conserva</p>
            </div>
          </div>
          <p className="plain-formula">
            En palabras: {formatNumber(home.baselineKwh)} − {formatNumber(home.currentBillKwh)} = {formatNumber(period.kwh)} kWh ahorrados. A {formatMoney(PILOT.kwhPrice)} por kWh son {formatMoney(period.mxn)}; se reparten 80/20.
          </p>
        </Card>
      </div>

      <div className="two-col">
        <Card className="dispute-card">
          {dispute ? (
            <>
              <div className="alert-title">
                <span>
                  <Icon name="alert" />
                </span>
                <div>
                  <h2>Posible diferencia por revisar</h2>
                  <p>
                    El ahorro calculado con el recibo y la generación medida se alejan {formatPercent(measurementGap(home), 0)}. Ahorro del recibo: {formatNumber(period.kwh)} kWh. Medido: {formatNumber(home.measuredGenerationKwh)} kWh.
                  </p>
                </div>
              </div>
              <div className="cause-list">
                <span>Cambio de ocupación</span>
                <span>Aparato nuevo</span>
                <span>Cambio de tarifa</span>
                <span>Falla del equipo</span>
              </div>
            </>
          ) : (
            <>
              <div className="alert-title">
                <span className="calm">
                  <Icon name="check" />
                </span>
                <div>
                  <h2>El recibo y el medidor coinciden</h2>
                  <p>La diferencia de este bimestre está dentro del margen de revisión (menos de 15%).</p>
                </div>
              </div>
              <div className="cause-list">
                <span>Sin causa marcada</span>
              </div>
            </>
          )}
          <button type="button" className={marked ? 'secondary-button' : 'danger-button'} onClick={() => setMarked(current => !current)}>
            {marked ? 'Quitar marca de revisión' : 'Marcar para revisión'}
          </button>
        </Card>
        <Card>
          <div className="credit-card">
            <div>
              <span>Saldo a favor de CFE</span>
              <strong>
                {formatNumber(credit)} <small>kWh acreditados</small>
              </strong>
              <p>{credit > 0 ? 'Reconocido a favor de la cooperativa' : 'Este bimestre el panel no supera el consumo base'}</p>
            </div>
            <div>
              <span>Valor estimado</span>
              <strong>{formatMoney(creditValue)}</strong>
              <p>A {formatMoney(PILOT.kwhPrice)} por kWh, si CFE lo acredita</p>
            </div>
          </div>
          <div className="model-note">
            <Icon name="info" size={17} />
            <span>El saldo a favor que reconozca CFE pertenece a la cooperativa. Con un solo panel, lo habitual es que no haya excedente.</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

function VerifyChart({ series }: { series: ReturnType<typeof verifySeries> }) {
  const width = 760
  const height = 300
  const left = 48
  const right = 730
  const top = 28
  const bottom = 250
  const maxValue = Math.max(...series.flatMap(point => [point.baseline, point.bill, point.measured, point.expectedP90])) * 1.12
  const step = (right - left) / series.length
  const x = (index: number) => left + step * index + step / 2
  const y = (value: number) => bottom - (value / maxValue) * (bottom - top)
  const measured = series.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)} ${y(point.measured).toFixed(1)}`).join(' ')
  const baseline = series.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)} ${y(point.baseline).toFixed(1)}`).join(' ')
  const band = [
    ...series.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)} ${y(point.expectedP90).toFixed(1)}`),
    ...[...series].reverse().map((point, index) => `L${x(series.length - 1 - index).toFixed(1)} ${y(point.expectedP10).toFixed(1)}`),
    'Z',
  ].join(' ')

  return (
    <svg className="main-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfica de consumo y generación por bimestre">
      {[0.25, 0.5, 0.75, 1].map(fraction => (
        <line key={fraction} x1={left} y1={y(maxValue * fraction)} x2={right} y2={y(maxValue * fraction)} className="gridline" />
      ))}
      <path d={band} className="range-band" />
      <path d={baseline} className="base-line" />
      <path d={measured} className="gen-line" />
      {series.map((point, index) => (
        <g key={point.label}>
          <rect x={x(index) - 16} y={y(point.bill)} width="32" height={Math.max(0, bottom - y(point.bill))} rx="5" className="actual-bar" />
          <text x={x(index)} y="286" textAnchor="middle">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
