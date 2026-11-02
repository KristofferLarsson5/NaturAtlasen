import type { Observation } from '../types/observation'

export type ObservationStats = {
  total: number
  uniqueTaxa: number
  groups: number
  years: number
  yearBreakdown: Record<number, number>
}

export function calculateObservationStats(observations: Observation[]): ObservationStats {
  const uniqueTaxa = new Set<string>()
  const groups = new Set<string>()
  const yearBreakdown = new Map<number, number>()

  for (const observation of observations) {
    const taxonKey = observation.scientificName || observation.swedishName || 'Okänt taxon'
    uniqueTaxa.add(taxonKey)

    if (observation.group) {
      groups.add(observation.group)
    }

    if (typeof observation.year === 'number' && Number.isFinite(observation.year)) {
      yearBreakdown.set(observation.year, (yearBreakdown.get(observation.year) ?? 0) + 1)
    }
  }

  const orderedYears = Object.fromEntries(
    [...yearBreakdown.entries()].sort(([yearA], [yearB]) => Number(yearA) - Number(yearB)),
  ) as Record<number, number>

  return {
    total: observations.length,
    uniqueTaxa: uniqueTaxa.size,
    groups: groups.size,
    years: Object.keys(orderedYears).length,
    yearBreakdown: orderedYears,
  }
}
