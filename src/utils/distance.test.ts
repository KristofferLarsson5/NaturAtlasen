import { describe, expect, it } from 'vitest'
import { calculateDistanceKm, filterObservationsByRadius } from './distance'

describe('distance utilities', () => {
  it('calculates the distance between two points in kilometers', () => {
    const distance = calculateDistanceKm(60.1137829, 19.9472856, 60.1137829, 19.9472856)
    expect(distance).toBe(0)

    const approx = calculateDistanceKm(60.1137829, 19.9472856, 60.1147829, 19.9472856)
    expect(approx).toBeGreaterThan(0)
    expect(approx).toBeLessThan(0.2)
  })

  it('filters observations that fall outside the selected radius', () => {
    const observations = [
      {
        id: 'near',
        scientificName: 'Testa',
        swedishName: 'Nära',
        group: 'Fåglar',
        date: '2024-05-01',
        year: 2024,
        latitude: 60.1137829,
        longitude: 19.9472856,
        distance: 0,
      },
      {
        id: 'far',
        scientificName: 'Testb',
        swedishName: 'Långt',
        group: 'Kärlväxter',
        date: '2024-05-02',
        year: 2024,
        latitude: 60.1237829,
        longitude: 19.9472856,
        distance: 0,
      },
    ]

    const result = filterObservationsByRadius(observations, 60.1137829, 19.9472856, 250)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('near')
  })
})
