import { describe, expect, it } from 'vitest'
import { AREAS } from './locations'

describe('location presets', () => {
  it('includes only the two specific search areas', () => {
    expect(AREAS.map((area) => area.name)).toEqual(['Tullarns ängar', 'Nabben'])
  })
})
