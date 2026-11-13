import { buildBoundingBox } from '../data/locations'
import type { AreaConfig } from '../data/locations'
import type { Observation, ObservationFeature } from '../types/observation'
import { calculateDistanceKm } from '../utils/distance'

const DEFAULT_LIMIT = 10000
const MAX_CONCURRENT_REQUESTS = 8
const FINBIF_ITEMS_URL = 'https://ogcapi.laji.fi/collections/lajiapi-connection/items'

export function getFinbifSourceUrl(area: AreaConfig, radiusMeters: number): string {
  const params = new URLSearchParams({
    bbox: buildBoundingBox(area.center.lat, area.center.lon, radiusMeters).join(','),
    limit: String(DEFAULT_LIMIT),
    offset: '0',
    f: 'json',
  })

  return `${FINBIF_ITEMS_URL}?${params.toString()}`
}

function normalizeText(value: unknown): string | null {
  if (typeof value === 'string') {
    const cleaned = value.trim()
    return cleaned.length > 0 && cleaned.toLowerCase() !== 'none' ? cleaned : null
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return null
}

function getYearFromValue(value: unknown): number | null {
  const text = normalizeText(value)
  if (!text) {
    return null
  }

  const date = new Date(text)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const year = date.getFullYear()
  return Number.isFinite(year) ? year : null
}

function translateFinnishGroupName(groupName: string | null): string {
  const groupMap: Record<string, string> = {
    Linnut: 'Fåglar',
    'Hyönteiset ja hämähäkkieläimet': 'Insekter och spindeldjur',
    Putkilokasvit: 'Kärlväxter',
    'Matelijat ja sammakkoeläimet': 'Kräldjur och groddjur',
    Nisäkkäät: 'Däggdjur',
    Nilviäiset: 'Blötdjur',
    Kalat: 'Fiskar',
    Sienet: 'Svampar',
    'Lehtisammalet': 'Lummer',
    'Sammalet': 'Mossor',
  }

  return groupMap[groupName ?? ''] ?? groupName ?? 'Okänd grupp'
}

export function mapFeatureToObservation(
  feature: ObservationFeature,
  centerLatitude: number,
  centerLongitude: number,
): Observation | null {
  const properties = feature.properties ?? {}
  const coordinates = feature.geometry?.coordinates ?? []

  const latitude = Number(coordinates[1])
  const longitude = Number(coordinates[0])

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  const scientificName =
    normalizeText(properties.Tieteellinen_nimi) ??
    normalizeText(properties.Alkuperainen_nimi) ??
    'Okänt taxon'

  const swedishName = normalizeText(properties.Ruotsinkielinen_nimi)

  const group = translateFinnishGroupName(normalizeText(properties.Elioryhma))
  const dateValue =
    normalizeText(properties.Aika) ??
    normalizeText(properties.Keruu_aloitus_pvm) ??
    normalizeText(properties.Lataus_pvm) ??
    'Okänt datum'

  const year = getYearFromValue(properties.Aika) ?? getYearFromValue(properties.Keruu_aloitus_pvm)
  const distanceKm = calculateDistanceKm(centerLatitude, centerLongitude, latitude, longitude)

  return {
    id: normalizeText(feature.id) ?? `${latitude}-${longitude}-${dateValue}`,
    scientificName,
    swedishName,
    group,
    date: dateValue,
    year,
    latitude,
    longitude,
    distance: Math.round(distanceKm * 1000),
  }
}

export async function fetchFinbifObservations(
  area: AreaConfig,
  radiusMeters: number,
): Promise<Observation[]> {
  const bbox = buildBoundingBox(area.center.lat, area.center.lon, radiusMeters)
  const allFeatures: ObservationFeature[] = []

  async function fetchPage(offset: number): Promise<{
    features: ObservationFeature[]
    total: number
    pageSize: number
  }> {
    const params = new URLSearchParams({
      bbox: bbox.join(','),
      limit: String(DEFAULT_LIMIT),
      offset: String(offset),
      f: 'json',
    })

    const response = await fetch(`/api/finbif/collections/lajiapi-connection/items?${params.toString()}`)

    if (!response.ok) {
      throw new Error('FinBIF svarade inte. Kontrollera anslutningen eller försök igen senare.')
    }

    const data = (await response.json()) as {
      features?: ObservationFeature[]
      total?: number
      pageSize?: number
    }

    const features = data.features ?? []
    const pageSize = Number(data.pageSize ?? features.length)

    return {
      features,
      total: Number(data.total ?? features.length),
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : DEFAULT_LIMIT,
    }
  }

  const firstPage = await fetchPage(0)
  allFeatures.push(...firstPage.features)

  const total = firstPage.total
  const pageSize = firstPage.pageSize || DEFAULT_LIMIT
  const remainingOffsets: number[] = []

  for (let offset = pageSize; offset < total; offset += pageSize) {
    remainingOffsets.push(offset)
  }

  let nextOffsetIndex = 0
  const workers = Array.from({ length: Math.min(MAX_CONCURRENT_REQUESTS, remainingOffsets.length) }, async () => {
    while (nextOffsetIndex < remainingOffsets.length) {
      const offset = remainingOffsets[nextOffsetIndex]
      nextOffsetIndex += 1
      const page = await fetchPage(offset)
      allFeatures.push(...page.features)
    }
  })

  await Promise.all(workers)

  return allFeatures
    .map((feature) => mapFeatureToObservation(feature, area.center.lat, area.center.lon))
    .filter((item): item is Observation => item !== null)
    .filter((observation) => observation.distance <= radiusMeters)
}
