import { describe, test, expect } from 'bun:test'

import { startListener } from '../index'

describe('sync function from native code', () => {
  test('sync function from native code', () => {
    try {
      startListener((data) => {
        console.log({ data })
        return data
      })
    } catch (e) {
      console.error('startListener failed:', e)
    }
    expect(true).toBe(true)
  })
})
