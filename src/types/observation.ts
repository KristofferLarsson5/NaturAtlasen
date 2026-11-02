export type Observation = {
  id: string
  scientificName: string
  swedishName: string | null
  group: string
  date: string
  year: number | null
  latitude: number
  longitude: number
  distance: number
}

export type ObservationFeature = {
  id?: string | null
  properties?: Record<string, unknown>
  geometry?: {
    coordinates?: [number, number]
  }
}
