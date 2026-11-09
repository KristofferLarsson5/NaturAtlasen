import { describe, expect, it } from 'vitest'
import { AREAS, MARIEHAMN } from './locations'

describe('location presets', () => {
  it('includes a Mariehamn-wide area with a wider default radius', () => {
    expect(AREAS.some((area) => area.name === 'Mariehamn')).toBe(true)
    expect(MARIEHAMN.defaultRadius).toBeGreaterThanOrEqual(3000)
    expect(MARIEHAMN.center.lat).toBeGreaterThan(60)
  })
})
