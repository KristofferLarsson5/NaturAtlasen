import { useMemo, useState } from 'react'
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

function App() {
  const [selectedArea, setSelectedArea] = useState<AreaConfig>(TULLARNS_ANGAR)
  const [selectedRadius, setSelectedRadius] = useState<number>(250)
  const [observations, setObservations] = useState<Observation[]>([])
  const [fetchedRadius, setFetchedRadius] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    setSelectedArea(nextArea)
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

  async function handleFetchData() {
    setLoading(true)
    setError(null)
    setFetchedRadius(null)

    try {
      const nextObservations = await fetchFinbifObservations(selectedArea, selectedRadius)
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
    </div>
  )
}

export default App
