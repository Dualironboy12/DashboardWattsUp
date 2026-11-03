import { useEffect, useRef, useState } from 'react'
import { divIcon, type DivIcon } from 'leaflet'
import { AttributionControl, Circle, CircleMarker, MapContainer, Marker, TileLayer, Tooltip, ZoomControl, useMap } from 'react-leaflet'
import type { MapPlace } from '@/model/piloto'
import 'leaflet/dist/leaflet.css'

export type StreetHit = { lat: number; lng: number; label: string }

const RADIUS_M = 500

const TILES = {
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  carto: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
} as const

function pinIcon(score: number, selected: boolean, high: boolean): DivIcon {
  const size = selected ? 54 : 46
  const tone = selected ? 'selected' : high ? 'high' : 'medium'
  return divIcon({
    className: `site-pin ${tone}`,
    html: `<span class="pin-face"><span>${score.toFixed(1)}</span></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function MapCamera({ lat, lng, token }: { lat: number; lng: number; token: string }) {
  const map = useMap()
  const seen = useRef<string | null>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => cancelAnimationFrame(frame)
  }, [map])

  useEffect(() => {
    if (seen.current === null) {
      seen.current = token
      map.setView([lat, lng], 16)
      return
    }
    if (seen.current === token) return
    seen.current = token
    map.flyTo([lat, lng], 16, { duration: 0.6 })
  }, [lat, lng, map, token])

  return null
}

export function SiteMap({ places, focus, onSelect, photon, note }: { places: readonly MapPlace[]; focus: MapPlace; onSelect: (id: string) => void; photon: StreetHit | null; note: string | null }) {
  const [provider, setProvider] = useState<keyof typeof TILES>('osm')
  const [tilesFailed, setTilesFailed] = useState(false)
  const tiles = TILES[provider]
  const camera = photon ?? focus
  const token = photon ? `calle:${photon.lat},${photon.lng}` : `sitio:${focus.id}`
  const status = [tilesFailed ? 'Sin conexión: no se cargan las calles.' : null, note].filter(Boolean).join(' ')

  return (
    <div className="map-canvas">
      <MapContainer center={[focus.lat, focus.lng]} zoom={16} zoomControl={false} attributionControl={false} className="site-map" aria-label="Mapa de Metepec, Atlixco">
        <TileLayer
          key={provider}
          attribution={tiles.attribution}
          url={tiles.url}
          eventHandlers={{
            tileerror: () => {
              if (provider === 'osm') setProvider('carto')
              else setTilesFailed(true)
            },
          }}
        />
        <AttributionControl position="bottomleft" prefix={false} />
        <ZoomControl position="bottomright" />
        <MapCamera lat={camera.lat} lng={camera.lng} token={token} />
        <Circle center={[focus.lat, focus.lng]} radius={RADIUS_M} pathOptions={{ color: '#8A1538', weight: 2, fillColor: '#8A1538', fillOpacity: 0.08 }} interactive={false} />
        {places.map(place => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={pinIcon(place.score, place.id === focus.id, place.score >= 8.5)}
            zIndexOffset={place.id === focus.id ? 800 : 0}
            title={place.name}
            alt={place.name}
            keyboard
            eventHandlers={{ click: () => onSelect(place.id) }}
          />
        ))}
        {photon ? (
          <CircleMarker center={[photon.lat, photon.lng]} radius={8} pathOptions={{ color: '#8A1538', fillColor: '#8A1538', fillOpacity: 1, weight: 2 }}>
            <Tooltip permanent direction="top">
              {photon.label}
            </Tooltip>
          </CircleMarker>
        ) : null}
      </MapContainer>
      {status ? <p className="map-status">{status}</p> : null}
    </div>
  )
}
