import { describe, expect, it } from 'vitest'
import { calculateObservationStats } from './statistics'

describe('observation statistics', () => {
  it('counts unique taxa, taxonomic groups and observations per year', () => {
    const observations = [
      {
        id: '1',
        scientificName: 'Acer platanoides',
        swedishName: 'Lönn',
        group: 'Kärlväxter',
        date: '2024-05-01',
        year: 2024,
        latitude: 60.1,
        longitude: 19.9,
        distance: 50,
      },
      {
        id: '2',
        scientificName: 'Acer platanoides',
        swedishName: 'Lönn',
        group: 'Kärlväxter',
        date: '2024-05-15',
        year: 2024,
        latitude: 60.12,
        longitude: 19.93,
        distance: 60,
      },
      {
        id: '3',
        scientificName: 'Corvus corone',
        swedishName: 'Kråka',
        group: 'Fåglar',
        date: '2023-04-01',
        year: 2023,
        latitude: 60.2,
        longitude: 20.0,
        distance: 120,
      },
      {
        id: '4',
        scientificName: 'Unknown',
        swedishName: null,
        group: 'Svampar',
        date: 'unknown',
        year: null,
        latitude: 60.3,
        longitude: 20.1,
        distance: 110,
      },
    ]

    const stats = calculateObservationStats(observations)
    expect(stats.total).toBe(4)
    expect(stats.uniqueTaxa).toBe(3)
    expect(stats.groups).toBe(3)
    expect(stats.years).toBe(2)
    expect(stats.yearBreakdown[2023]).toBe(1)
    expect(stats.yearBreakdown[2024]).toBe(2)
  })
})
