import { useState } from 'react'
import { Icon } from '@/components/Icon'
import { Card, Pill } from '@/components/ui'
import { BASELINE_RECEIPTS, PILOT, TARIFF_OPTIONS, baselineAverage, formatMoney, formatNumber, panelSavingsBimester } from '@/model/piloto'

type ManualReceipt = { period: string; kwh: number; amount: number }

export function ReceiptsScreen() {
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [tariff, setTariff] = useState<(typeof TARIFF_OPTIONS)[number]>('1')
  const [manual, setManual] = useState<ManualReceipt | null>(null)
  const [form, setForm] = useState({ period: 'Ene—Feb 2025', kwh: '198', amount: '396' })
  const average = baselineAverage()
  const estimate = panelSavingsBimester()
  const shown = manual ?? { period: 'Promedio del consumo base', kwh: average.kwh, amount: average.amount }

  return (
    <div className="content-column">
      <div className="two-col">
        <Card>
          <div className="section-title">
            <div>
              <span className="eyebrow">Nuevo recibo</span>
              <h2>Carga un recibo de CFE</h2>
              <p>En esta demostración la lectura está simulada. No se envía el archivo.</p>
            </div>
          </div>
          {!uploaded && !error ? (
            <button type="button" className="drop-zone" onClick={() => setUploaded(true)}>
              <span>
                <Icon name="upload" size={26} />
              </span>
              <strong>Arrastra tu recibo aquí</strong>
              <p>o haz clic para simular la carga</p>
              <small>PDF, JPG o PNG</small>
            </button>
          ) : null}
          {uploaded && !error ? (
            <div className="upload-success">
              <span>
                <Icon name="check" size={24} />
              </span>
              <div>
                <strong>recibo_cfe_ene-feb.pdf</strong>
                <p>Lectura simulada. Los importes de abajo siguen siendo el ejemplo de Casa 04.</p>
              </div>
              <button type="button" aria-label="Quitar archivo" onClick={() => setUploaded(false)}>
                <Icon name="close" />
              </button>
            </div>
          ) : null}
          {error ? (
            <div className="upload-error">
              <Icon name="alert" />
              <div>
                <strong>No pudimos leer este recibo</strong>
                <p>La imagen está borrosa. Intenta con otra foto o captura los datos manualmente.</p>
              </div>
            </div>
          ) : null}
          <div className="upload-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setError(current => !current)
                setUploaded(false)
              }}
            >
              {error ? 'Volver a la carga' : 'Simular error de lectura'}
            </button>
            <button type="button" className="text-button" onClick={() => setManualOpen(current => !current)}>
              Capturar manualmente
            </button>
          </div>
          {manualOpen ? (
            <form
              className="manual-form"
              onSubmit={event => {
                event.preventDefault()
                const kwh = Number(form.kwh)
                const amount = Number(form.amount)
                if (!form.period.trim() || !Number.isFinite(kwh) || !Number.isFinite(amount)) return
                setManual({ period: form.period.trim(), kwh, amount })
                setError(false)
              }}
            >
              <label>
                Periodo de facturación
                <input value={form.period} onChange={event => setForm(current => ({ ...current, period: event.target.value }))} />
              </label>
              <label>
                Consumo (kWh)
                <input inputMode="decimal" value={form.kwh} onChange={event => setForm(current => ({ ...current, kwh: event.target.value }))} />
              </label>
              <label>
                Importe (MXN)
                <input inputMode="decimal" value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} />
              </label>
              <button type="submit" className="primary-button">
                Usar estos datos
              </button>
            </form>
          ) : null}
        </Card>
        <Card>
          <div className="section-title">
            <div>
              <span className="eyebrow">Vivienda</span>
              <h2>Casa 04 · Calle Reforma</h2>
              <p>Consumo base calculado con 3 recibos</p>
            </div>
            <Pill tone="good">Completo</Pill>
          </div>
          <div className="baseline">
            <span>Consumo base bimestral</span>
            <strong>
              {formatNumber(average.kwh, 0)} <small>kWh</small>
            </strong>
            <p>Promedio de los 3 recibos previos a la instalación · {formatMoney(average.amount)}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="section-title">
          <div>
            <span className="eyebrow">Lectura paso a paso</span>
            <h2>Del recibo al ahorro estimado</h2>
          </div>
        </div>
        <div className="process-flow">
          <div>
            <span className="step">1</span>
            <Icon name="receipt" size={25} />
            <small>Recibo</small>
            <strong>{shown.period}</strong>
            <p>{formatMoney(shown.amount)}</p>
          </div>
          <b aria-hidden="true">→</b>
          <div>
            <span className="step">2</span>
            <Icon name="chart" size={25} />
            <small>Consumo</small>
            <strong>{formatNumber(shown.kwh, 0)} kWh</strong>
            <p>60 días · bimestre</p>
          </div>
          <b aria-hidden="true">→</b>
          <div>
            <span className="step">3</span>
            <Icon name="sun" size={25} />
            <small>Tarifa y bloque</small>
            <select aria-label="Tarifa" value={tariff} onChange={event => setTariff(event.target.value as (typeof TARIFF_OPTIONS)[number])}>
              {TARIFF_OPTIONS.map(option => (
                <option key={option} value={option}>
                  Tarifa {option}
                </option>
              ))}
            </select>
            <p>El demo valora el kWh en {formatMoney(PILOT.kwhPrice)}</p>
          </div>
          <b aria-hidden="true">→</b>
          <div className="featured">
            <span className="step">4</span>
            <Icon name="sun" size={25} />
            <small>Ahorro con panel</small>
            <strong>
              {formatMoney(estimate.p10, 0)}—{formatMoney(estimate.p90, 0)}
            </strong>
            <p>P50 {formatMoney(estimate.p50, 0)} por bimestre</p>
          </div>
        </div>
        <p className="plain-formula">Esta estimación usa la generación del panel (720 / 803 / 870 kWh al año), no el importe de un solo recibo. El ahorro observado de un bimestre está en Verificación.</p>
      </Card>

      <Card>
        <div className="section-title">
          <div>
            <span className="eyebrow">Historial</span>
            <h2>Recibos del consumo base</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Periodo de facturación</th>
                <th>Consumo</th>
                <th>Importe</th>
                <th>Tarifa</th>
                <th>Origen</th>
              </tr>
            </thead>
            <tbody>
              {BASELINE_RECEIPTS.map(row => (
                <tr key={row.period}>
                  <td>{row.period}</td>
                  <td>{row.kwh} kWh</td>
                  <td>{formatMoney(row.amount)}</td>
                  <td>{row.tariff}</td>
                  <td>
                    <Pill>{row.source}</Pill>
                  </td>
                </tr>
              ))}
              <tr className="average-row">
                <td>Promedio · consumo base</td>
                <td>{formatNumber(average.kwh, 0)} kWh</td>
                <td>{formatMoney(average.amount)}</td>
                <td>—</td>
                <td>
                  <Pill tone="berry">Base</Pill>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="warning-note">
          <Icon name="alert" size={18} />
          <span>
            <strong>Revisa la temporada.</strong> Los 3 recibos pueden no representar el año completo.
          </span>
        </div>
      </Card>
    </div>
  )
}
