import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { GroupChart } from './components/GroupChart'
import { Header } from './components/Header'
import { StatCard } from './components/StatCard'
import { TopTaxa } from './components/TopTaxa'
import { YearChart } from './components/YearChart'
import { AREAS, TULLARNS_ANGAR, type AreaConfig } from './data/locations'
import { fetchFinbifObservations, getFinbifSourceUrl } from './services/finbif'
import type { Observation } from './types/observation'
import { filterObservationsByRadius } from './utils/distance'
import { calculateObservationStats } from './utils/statistics'
import './App.css'

function getGroupBreakdown(observations: Observation[]) {
  const groups = new Map<string, number>()

  for (const observation of observations) {
    groups.set(observation.group, (groups.get(observation.group) ?? 0) + 1)
  }

  return [...groups.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count)
}

function getYearBreakdown(observations: Observation[]) {
  const years = new Map<number, number>()

  for (const observation of observations) {
    if (typeof observation.year === 'number' && Number.isFinite(observation.year)) {
      years.set(observation.year, (years.get(observation.year) ?? 0) + 1)
    }
  }

  return [...years.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((left, right) => left.year - right.year)
}

function getTopTaxa(observations: Observation[]) {
  const taxa = new Map<string, { label: string; scientificName: string; count: number }>()

  for (const observation of observations) {
    const scientificName = observation.scientificName || 'Okänt taxon'
    const label = observation.swedishName || scientificName || 'Okänt taxon'
    const key = scientificName

    const existing = taxa.get(key) ?? {
      label,
      scientificName,
      count: 0,
    }

    existing.count += 1
    taxa.set(key, existing)
  }

  return [...taxa.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 15)
}

function getRadiusOptions(area: AreaConfig) {
  return area.name === 'Mariehamn' ? [250, 500, 1000, 2000, 5000] : [250, 500]
}

function App() {
  const [selectedArea, setSelectedArea] = useState<AreaConfig>(TULLARNS_ANGAR)
  const [selectedRadius, setSelectedRadius] = useState<number>(250)
  const [observations, setObservations] = useState<Observation[]>([])
  const [fetchedRadius, setFetchedRadius] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const observationCache = useRef<Map<string, Observation[]>>(new Map())
  const mapRef = useRef<HTMLDivElement | null>(null)

  const filteredObservations = useMemo(
    () =>
      filterObservationsByRadius(
        observations,
        selectedArea.center.lat,
        selectedArea.center.lon,
        selectedRadius,
      ),
    [observations, selectedArea, selectedRadius],
  )

  const stats = useMemo(() => calculateObservationStats(filteredObservations), [filteredObservations])
  const groupData = useMemo(() => getGroupBreakdown(filteredObservations), [filteredObservations])
  const yearData = useMemo(() => getYearBreakdown(filteredObservations), [filteredObservations])
  const topTaxa = useMemo(() => getTopTaxa(filteredObservations), [filteredObservations])

  function handleAreaChange(areaName: string) {
    const nextArea = AREAS.find((area) => area.name === areaName)
    if (!nextArea) {
      return
    }

    const nextRadiusOptions = getRadiusOptions(nextArea)
    const nextRadius =
      nextRadiusOptions.includes(selectedRadius) || nextArea.defaultRadius === undefined
        ? selectedRadius
        : nextArea.defaultRadius ?? nextRadiusOptions[0]

    setSelectedArea(nextArea)
    setSelectedRadius(nextRadiusOptions.includes(nextRadius) ? nextRadius : nextRadiusOptions[0])
    setObservations([])
    setFetchedRadius(null)
    setError(null)
  }

  function handleRadiusChange(radius: number) {
    setSelectedRadius(radius)
    setObservations([])
    setFetchedRadius(null)
    setError(null)
  }

  useEffect(() => {
    if (!mapRef.current) {
      return
    }

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
    }).setView([60.10, 19.95], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const markers = AREAS.map((area) => {
      const color = area.name === selectedArea.name ? '#1f5d48' : '#79a18d'
      const marker = L.circleMarker([area.center.lat, area.center.lon], {
        radius: area.name === selectedArea.name ? 9 : 7,
        color: '#ffffff',
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }).addTo(map)

      marker.bindPopup(`${area.name}<br>${area.center.lat.toFixed(7)}, ${area.center.lon.toFixed(7)}`)
      return marker
    })

    map.fitBounds(
      L.latLngBounds(markers.map((marker) => marker.getLatLng())),
      { padding: [24, 24] },
    )

    return () => {
      map.remove()
    }
  }, [selectedArea])

  async function handleFetchData() {
    const cacheKey = `${selectedArea.name}:${selectedRadius}`
    const cachedObservations = observationCache.current.get(cacheKey)

    if (cachedObservations) {
      setObservations(cachedObservations)
      setFetchedRadius(selectedRadius)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    setFetchedRadius(null)

    try {
      const nextObservations = await fetchFinbifObservations(selectedArea, selectedRadius)
      observationCache.current.set(cacheKey, nextObservations)
      setObservations(nextObservations)
      setFetchedRadius(selectedRadius)
    } catch (fetchError) {
      setObservations([])
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Ett fel uppstod vid hämtningen av observationer från FinBIF.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Header
        areas={AREAS}
        selectedArea={selectedArea}
        onAreaChange={handleAreaChange}
        radius={selectedRadius}
        onRadiusChange={handleRadiusChange}
        onFetchData={handleFetchData}
        loading={loading}
      />

      <p className="site-note">
        {selectedArea.description}
        {fetchedRadius !== null ? (
          <> <a href={getFinbifSourceUrl(selectedArea, fetchedRadius)} target="_blank" rel="noreferrer">Visa data</a></>
        ) : null}
      </p>

      {error ? (
        <div className="error-banner" role="alert">
          {error}
        </div>
      ) : null}

      <section className="stats-grid" aria-label="Statistiköversikt">
        <StatCard label="Totalt antal observationer" value={stats.total} accent="green" />
        <StatCard label="Antal unika taxa" value={stats.uniqueTaxa} accent="sand" />
        <StatCard label="Antal organismgrupper" value={stats.groups} accent="green" />
        <StatCard label="Antal observationsår" value={stats.years} accent="blue" />
      </section>

      <section className="charts-grid">
        <GroupChart data={groupData} />
        <YearChart data={yearData} />
      </section>

      <section className="detail-panel">
        <TopTaxa taxa={topTaxa.map((taxon) => ({ ...taxon, label: taxon.label }))} />
      </section>

      <section className="map-panel card" aria-label="Översikt över koordinater">
        <div className="map-panel__header">
          <h2>Koordinater för områden</h2>
          <span>Mariehamn</span>
        </div>

        <div
          ref={mapRef}
          className="map-viewport"
          role="img"
          aria-label="Karta över Mariehamn med de tre områdena markerade"
        />

        <div className="coordinate-list">
          {AREAS.map((area) => (
            <div key={area.name} className="coordinate-item">
              <div>
                <strong>{area.name}</strong>
                <span>{area.center.lat.toFixed(7)}, {area.center.lon.toFixed(7)}</span>
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${area.center.lat}&mlon=${area.center.lon}#map=15/${area.center.lat}/${area.center.lon}`}
                target="_blank"
                rel="noreferrer"
              >
                Öppna i karta
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
