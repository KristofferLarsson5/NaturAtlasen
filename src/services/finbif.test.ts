import { describe, expect, it, vi } from 'vitest'
import { MARIEHAMN } from '../data/locations'
import { fetchFinbifObservations } from './finbif'

describe('FinBIF fetch', () => {
  it('fetches all pages without capping and starts multiple page requests in parallel', async () => {
    const totalFeatures = 25000
    const features = Array.from({ length: totalFeatures }, (_, index) => ({
      id: `obs-${index}`,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [19.94 + (index % 50) * 0.001, 60.09 + (index % 40) * 0.001],
      },
      properties: {
        Tieteellinen_nimi: `Species ${index}`,
        Ruotsinkielinen_nimi: `Art ${index}`,
        Elioryhma: 'Linnut',
        Aika: '2024-05-01',
      },
    }))

    let activeRequests = 0
    let maxConcurrentRequests = 0

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      activeRequests += 1
      maxConcurrentRequests = Math.max(maxConcurrentRequests, activeRequests)

      const rawUrl = String(input)
      const url = new URL(rawUrl, 'http://localhost')
      const offset = Number(url.searchParams.get('offset') ?? '0')
      const limit = Number(url.searchParams.get('limit') ?? '0')

      await new Promise((resolve) => setTimeout(resolve, 10))

      const page = features.slice(offset, offset + limit)
      activeRequests -= 1

      return new Response(
        JSON.stringify({
          features: page,
          total: totalFeatures,
          pageSize: page.length,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    })

    vi.stubGlobal('fetch', fetchMock)

    try {
      const observations = await fetchFinbifObservations(MARIEHAMN, 5000)

      expect(observations.length).toBe(totalFeatures)
      expect(maxConcurrentRequests).toBeGreaterThan(1)
      expect(fetchMock.mock.calls.length).toBeGreaterThan(1)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
