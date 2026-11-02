import type { Observation } from '../types/observation'

export function calculateDistanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const earthRadiusKm = 6371
  const latA = (latitudeA * Math.PI) / 180
  const lonA = (longitudeA * Math.PI) / 180
  const latB = (latitudeB * Math.PI) / 180
  const lonB = (longitudeB * Math.PI) / 180

  const deltaLat = latB - latA
  const deltaLon = lonB - lonA

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

export function filterObservationsByRadius(
  observations: Observation[],
  latitude: number,
  longitude: number,
  radiusMeters: number,
): Observation[] {
  return observations
    .map((observation) => {
      const distanceKm = calculateDistanceKm(
        latitude,
        longitude,
        observation.latitude,
        observation.longitude,
      )
      const distanceMeters = Math.round(distanceKm * 1000)

      return {
        ...observation,
        distance: distanceMeters,
      }
    })
    .filter((observation) => observation.distance <= radiusMeters)
}
