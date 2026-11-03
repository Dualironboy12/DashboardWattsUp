import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@/components/Icon'
import { SiteMap, type StreetHit } from '@/components/SiteMap'
import { Card, Pill, RangeValue } from '@/components/ui'
import { PILOT, PLACES, SEARCH_BBOX, SITES, UNCERTAINTY, alternativesNear, formatMoney, formatNumber, simpleReferenceKwh, siteOutlook } from '@/model/piloto'

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

function insideSearchBox(lat: number, lng: number) {
  return lat >= SEARCH_BBOX.minLat && lat <= SEARCH_BBOX.maxLat && lng >= SEARCH_BBOX.minLng && lng <= SEARCH_BBOX.maxLng
}

async function findStreet(query: string, signal: AbortSignal): Promise<StreetHit | null> {
  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '5')
  url.searchParams.set('lat', String(SITES[0].lat))
  url.searchParams.set('lon', String(SITES[0].lng))
  url.searchParams.set('bbox', `${SEARCH_BBOX.minLng},${SEARCH_BBOX.minLat},${SEARCH_BBOX.maxLng},${SEARCH_BBOX.maxLat}`)
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('photon')
  const data = (await response.json()) as {
    features?: { geometry?: { coordinates?: [number, number] }; properties?: { name?: string; street?: string; city?: string; county?: string; state?: string } }[]
  }
  for (const feature of data.features ?? []) {
    const [lng, lat] = feature.geometry?.coordinates ?? []
    if (lat === undefined || lng === undefined || !insideSearchBox(lat, lng)) continue
    if (feature.properties?.state && feature.properties.state !== 'Puebla') continue
    const label = [feature.properties?.name || feature.properties?.street, feature.properties?.city || feature.properties?.county].filter(Boolean).join(', ')
    return { lat, lng, label: label || query }
  }
  return null
}

export function EvaluateScreen() {
  const [selectedId, setSelectedId] = useState(SITES[0].id)
  const [focusId, setFocusId] = useState(PLACES[0].id)
  const [query, setQuery] = useState('')
  const [photon, setPhoton] = useState<StreetHit | null>(null)
  const [searchNote, setSearchNote] = useState<string | null>(null)
  const [preselectedId, setPreselectedId] = useState<string | null>(null)
  const [co2Factor, setCo2Factor] = useState<number>(PILOT.co2Factor)
  const site = SITES.find(item => item.id === selectedId) ?? SITES[0]
  const focus = PLACES.find(item => item.id === focusId) ?? PLACES[0]
  const outlook = useMemo(() => siteOutlook(site, PILOT.kwhPrice, co2Factor), [site, co2Factor])
  const alternatives = useMemo(() => alternativesNear(focus), [focus])
  const localMatches = query.trim() ? PLACES.filter(item => normalize(item.name).includes(normalize(query.trim()))) : PLACES
  const visiblePlaces = localMatches.length > 0 ? localMatches : PLACES
  const years = (value: number | null) => (value === null ? '—' : value.toFixed(1))

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setPhoton(null)
      setSearchNote(null)
      return
    }
    const found = PLACES.filter(item => normalize(item.name).includes(normalize(q)))
    if (found.length > 0) {
      setPhoton(null)
      setSearchNote(null)
      setFocusId(found[0].id)
      if (found[0].siteId) setSelectedId(found[0].siteId)
      return
    }
    const controller = new AbortController()
    setPhoton(null)
    setSearchNote(null)
    const timer = window.setTimeout(() => {
      findStreet(q, controller.signal).then(
        hit => {
          if (controller.signal.aborted) return
          if (!hit) {
            setSearchNote('No encontré esa calle en Metepec o Atlixco.')
            return
          }
          setPhoton(hit)
        },
        error => {
          if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) return
          setSearchNote('Sin conexión: la búsqueda se queda en las viviendas del demo.')
        },
      )
    }, 400)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  function choose(id: string) {
    const place = PLACES.find(item => item.id === id)
    if (!place) return
    setFocusId(place.id)
    if (place.siteId) setSelectedId(place.siteId)
    setQuery('')
    setPhoton(null)
    setSearchNote(null)
  }

  return (
    <div className="evaluate-layout">
      <Card className="map-card">
        <div className="map-search">
          <Icon name="search" size={18} />
          <input aria-label="Buscar ubicación" placeholder="Busca una colonia, calle o referencia" value={query} onChange={event => setQuery(event.target.value)} />
        </div>
        <div className="map-toolbar">
          <span className="map-chip">Alternativas a 500 m</span>
          <span>
            <i className="dot high" /> Alta <i className="dot medium" /> Media
          </span>
        </div>
        <SiteMap places={visiblePlaces} focus={focus} onSelect={choose} photon={photon} note={searchNote} />
        <div className="map-selection">
          <span>
            <Icon name="location" size={17} />
          </span>
          <div>
            <small>Vivienda seleccionada</small>
            <strong>{focus.name}</strong>
          </div>
          <Pill tone={focus.score >= 8.5 ? 'good' : 'warn'}>{focus.score >= 8.5 ? 'Idoneidad alta' : 'Idoneidad media'}</Pill>
        </div>
      </Card>

      <div className="evaluation-detail">
        <Card className="site-score">
          <div className="card-heading">
            <div>
              <span className="eyebrow">Evaluación preliminar</span>
              <h2>{site.name}</h2>
              <p>Metepec, Atlixco · Puebla</p>
            </div>
            <div className="score-ring" style={{ background: `conic-gradient(var(--green) 0 ${site.score * 10}%, #e4e0da ${site.score * 10}%)` }}>
              <strong>{site.score.toFixed(1)}</strong>
              <span>de 10</span>
            </div>
          </div>
          <div className="score-bars">
            {site.bars.map(bar => (
              <div className="score-row" key={bar.label}>
                <div>
                  <span>{bar.label}</span>
                  <strong>{bar.score.toFixed(1)}</strong>
                </div>
                <div className="bar">
                  <i style={{ width: `${bar.score * 10}%` }} />
                </div>
                <small>{bar.why}</small>
              </div>
            ))}
          </div>
          <div className="model-note">
            <Icon name="info" size={17} />
            <span>
              <strong>Modelo físico + incertidumbre estadística (fase 1).</strong> Aprendizaje automático con datos del piloto en fase 2.
            </span>
          </div>
        </Card>

        <Card>
          <div className="section-title">
            <div>
              <span className="eyebrow">Resultados estimados</span>
              <h2>Dinero primero, energía después</h2>
            </div>
            <Pill>Rango anual</Pill>
          </div>
          <div className="range-grid">
            <RangeValue emphasis label="Ahorro bruto" values={[formatMoney(outlook.p10.savings, 0), formatMoney(outlook.p50.savings, 0), formatMoney(outlook.p90.savings, 0)]} unit="MXN" />
            <RangeValue label="Recuperación" values={[years(outlook.p10.payback), years(outlook.p50.payback), years(outlook.p90.payback)]} unit="años" />
            <RangeValue label="Generación" values={[formatNumber(outlook.p10.kwh, 0), formatNumber(outlook.p50.kwh, 0), formatNumber(outlook.p90.kwh, 0)]} unit="kWh" />
          </div>
        </Card>

        <Card className="comparison-card">
          <div className="section-title">
            <h2>Estimación simple vs. este sistema</h2>
          </div>
          <div className="comparison">
            <div>
              <small>Referencia simple</small>
              <strong>
                {formatNumber(simpleReferenceKwh())} <em>kWh/año</em>
              </strong>
              <p>5 h solar pico × 80%. Sin rango ni condiciones del sitio.</p>
            </div>
            <div>
              <small>Este sistema</small>
              <strong>
                {formatNumber(outlook.p10.kwh, 0)}—{formatNumber(outlook.p90.kwh, 0)} <em>kWh/año</em>
              </strong>
              <p>Incluye clima, sombra, techo, consumo y tarifa. P50 {formatNumber(outlook.p50.kwh, 0)} kWh.</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="section-title">
            <div>
              <h2>¿De dónde viene la incertidumbre?</h2>
              <p>La tarifa mueve el resultado más que el sol del sitio.</p>
            </div>
          </div>
          <div className="uncertainty">
            <div className="stacked">
              {UNCERTAINTY.map(item => (
                <i key={item.id} className={item.id} style={{ width: `${item.share}%` }} />
              ))}
            </div>
            <div className="legend">
              {UNCERTAINTY.map(item => (
                <span key={item.id}>
                  <i className={item.id} />
                  {item.label} {item.share}%
                </span>
              ))}
            </div>
          </div>
          <div className="co2-row">
            <div className="co2-icon">CO₂</div>
            <div>
              <small>CO₂ evitado al año</small>
              <strong>
                {formatNumber(outlook.p10.co2, 2)}—{formatNumber(outlook.p90.co2, 2)} t <em>(P50 {formatNumber(outlook.p50.co2, 2)} t)</em>
              </strong>
              <p>Contra {PILOT.co2Source}. El factor es ilustrativo y sigue por definir.</p>
              <label className="factor-field">
                Factor t/MWh
                <input
                  aria-label="Factor de CO₂ en toneladas por MWh"
                  type="number"
                  min={0.05}
                  max={1.2}
                  step={0.01}
                  value={co2Factor}
                  onChange={event => setCo2Factor(Number(event.target.value) || PILOT.co2Factor)}
                />
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <div className="section-title">
            <h2>Alternativas cercanas mejor calificadas</h2>
          </div>
          <div className="alternatives">
            {alternatives.map((alternative, index) => (
              <button key={alternative.id} type="button" className={alternative.id === focus.id ? 'selected' : ''} onClick={() => choose(alternative.id)}>
                <span className="rank">{index + 1}</span>
                <strong>{alternative.name}</strong>
                <span>{alternative.distanceM} m</span>
                <Pill tone="good">{alternative.score.toFixed(1)}</Pill>
                {alternative.siteId ? <Icon name="chevron" size={17} /> : <span />}
              </button>
            ))}
          </div>
          <button type="button" className="primary-button" onClick={() => setPreselectedId(current => (current === site.id ? null : site.id))}>
            {preselectedId === site.id ? 'Quitar preselección' : 'Preseleccionar vivienda'}
          </button>
          {preselectedId ? <p className="fine-print">{SITES.find(item => item.id === preselectedId)?.name} queda preseleccionada para la visita técnica.</p> : null}
          <p className="fine-print">
            <Icon name="alert" size={15} /> Evaluación preliminar. No sustituye la inspección técnica.
          </p>
        </Card>
      </div>
    </div>
  )
}
