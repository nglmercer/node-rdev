import { describe, test, expect } from 'bun:test'

import { startListener } from '../index'

describe('sync function from native code', () => {
  test('sync function from native code', (err) => {
    startListener((data) => {
      console.log({ data })
    })
    if (err) {
      throw err
    }
    expect(true).toBe(true)
  })
})
