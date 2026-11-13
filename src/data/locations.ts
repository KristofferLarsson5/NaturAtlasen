export type AreaConfig = {
  name: string
  center: {
    lat: number
    lon: number
  }
  description: string
}

export const TULLARNS_ANGAR: AreaConfig = {
  name: 'Tullarns ängar',
  center: {
    lat: 60.09512,
    lon: 19.94753,
  },
  description: 'Preliminär sökpunkt för Tullarns ängar i Mariehamn.',
}

export const NABBEN: AreaConfig = {
  name: 'Nabben',
  center: {
    lat: 60.1137829,
    lon: 19.9472856,
  },
  description: 'Preliminär sökpunkt för naturinventeringar i Mariehamn.',
}

export const AREAS: AreaConfig[] = [TULLARNS_ANGAR, NABBEN]

export function buildBoundingBox(
  latitude: number,
  longitude: number,
  radiusMeters: number,
): [number, number, number, number] {
  const latDelta = radiusMeters / 1000 / 111.32
  const lonDelta = radiusMeters / 1000 / (111.32 * Math.cos((latitude * Math.PI) / 180))

  return [
    longitude - lonDelta,
    latitude - latDelta,
    longitude + lonDelta,
    latitude + latDelta,
  ]
}
