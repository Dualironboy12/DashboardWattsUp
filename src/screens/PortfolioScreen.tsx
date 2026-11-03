import { useEffect, useState } from 'react'
import { Icon } from '@/components/Icon'
import { Card, Pill } from '@/components/ui'
import { PILOT, formatMoney, formatNumber, formatPercent, portfolioSnapshot, waterfall, type HomeStatus } from '@/model/piloto'

function statusTone(status: HomeStatus): 'good' | 'danger' | 'warn' | 'neutral' {
  if (status === 'Al corriente') return 'good'
  if (status === 'Atraso') return 'danger'
  if (status === 'En revisión') return 'warn'
  return 'neutral'
}

export function PortfolioScreen() {
  const snapshot = portfolioSnapshot()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = snapshot.rows.find(row => row.home.id === selectedId) ?? null

  useEffect(() => {
    if (!selectedId) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  const recoveredShare = snapshot.capitalRecovered / PILOT.investmentTotal

  return (
    <div className="content-column">
      <div className="kpi-grid">
        <Card>
          <div className="kpi-icon">
            <Icon name="homes" />
          </div>
          <span>Viviendas instaladas</span>
          <strong>
            {snapshot.installed} <small>de {PILOT.homes}</small>
          </strong>
          <p>Piloto completo</p>
        </Card>
        <Card>
          <span>Capital recuperado</span>
          <strong>
            {formatMoney(snapshot.capitalRecovered, 0)} <small>/ {formatMoney(PILOT.investmentTotal, 0)}</small>
          </strong>
          <div className="progress">
            <i style={{ width: `${recoveredShare * 100}%` }} />
          </div>
          <p>{formatPercent(recoveredShare)} del capital, al ritmo esperado de la ficha</p>
        </Card>
        <Card>
          <span>Ahorro total del periodo</span>
          <strong>
            {formatMoney(snapshot.savings)} <small>MXN</small>
          </strong>
          <p>Suma del bimestre en la tabla</p>
        </Card>
        <Card>
          <span>Cuota recibida del periodo</span>
          <strong>
            {formatMoney(snapshot.collected)} <small>MXN</small>
          </strong>
          <p>
            80% del ahorro cobrado · {snapshot.pendingCount} cuotas en atraso
          </p>
        </Card>
      </div>

      <Card>
        <div className="section-title">
          <div>
            <span className="eyebrow">10 viviendas</span>
            <h2>Seguimiento del piloto</h2>
          </div>
        </div>
        <div className="table-wrap portfolio-table">
          <table>
            <thead>
              <tr>
                <th>Vivienda</th>
                <th>Consumo base</th>
                <th>Recibo actual</th>
                <th>Ahorro</th>
                <th>Cuota 80%</th>
                <th>Hogar 20%</th>
                <th>Liquidación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.rows.map(row => (
                <tr key={row.home.id} role="button" aria-label={`Ver detalle de ${row.home.name}`} onClick={() => setSelectedId(row.home.id)} onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedId(row.home.id)
                  }
                }} tabIndex={0} aria-selected={selectedId === row.home.id}>
                  <td>
                    <strong>{row.home.name}</strong>
                  </td>
                  <td>{formatNumber(row.home.baselineKwh)} kWh</td>
                  <td>{formatNumber(row.home.currentBillKwh)} kWh</td>
                  <td>{formatMoney(row.mxn)}</td>
                  <td>
                    <strong>{formatMoney(row.quota)}</strong>
                  </td>
                  <td>{formatMoney(row.household)}</td>
                  <td>
                    <div className="mini-progress">
                      <i style={{ width: `${row.liquidation * 100}%` }} />
                    </div>
                    <small>{formatPercent(row.liquidation, 0)}</small>
                  </td>
                  <td>
                    <Pill tone={statusTone(row.home.status)}>{row.home.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selected ? (
        <div className="drawer-backdrop" onClick={() => setSelectedId(null)}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="detalle-vivienda" onClick={event => event.stopPropagation()}>
            <button type="button" className="drawer-close" aria-label="Cerrar panel" onClick={() => setSelectedId(null)}>
              <Icon name="close" />
            </button>
            <span className="eyebrow">Detalle de vivienda</span>
            <h2 id="detalle-vivienda">{selected.home.name}</h2>
            <p className="muted">Sistema instalado · Panel 550 W + microinversor</p>
            <div className="drawer-metrics">
              <div>
                <span>Ahorro del bimestre</span>
                <strong>{formatMoney(selected.mxn)}</strong>
              </div>
              <div>
                <span>Avance de liquidación</span>
                <strong>{formatPercent(selected.liquidation)}</strong>
              </div>
            </div>
            <h3>Cascada de la cuota</h3>
            <p className="muted">Orden de los {formatMoney(selected.quota)} de este bimestre. La reserva y el fondo esperan a que el capital esté devuelto.</p>
            <Waterfall quota={selected.quota} />
            <div className="model-note">
              <Icon name="info" size={17} />
              <span>Al liquidarse el sistema, la cuota baja a operación, mantenimiento, reposición y una aportación al fondo. En el año 5 ninguna vivienda llega a ese punto.</span>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}

function Waterfall({ quota }: { quota: number }) {
  const split = waterfall(quota)
  const steps = [
    ['1', 'Operación y mantenimiento', split.om],
    ['2', 'Devolución a financiadores', split.repayment],
    ['3', 'Reserva de reposición', split.reserve],
    ['4', 'Fondo cooperativo', split.fund],
  ] as const
  return (
    <div className="waterfall">
      {steps.map(([index, label, amount]) => (
        <div key={label}>
          <span>{index}</span>
          <p>{label}</p>
          <strong>{formatMoney(amount)}</strong>
        </div>
      ))}
    </div>
  )
}
