import { getOrderedKeys } from './utils'

describe('Unit test module utilities', () => {
  test('`getOrderKeys gets the correct order', () => {
    const templates = { 1: {}, 6: {}, 2: {}, 4: {} }
    const expected = ['1', '2', '4', '6']

    expect(getOrderedKeys(templates)).toEqual(expected)
  })

  test('`getOrderKeys gets the correct order reversed', () => {
    const templates = { 1: {}, 6: {}, 2: {}, 4: {} }
    const expected = ['6', '4', '2', '1']

    expect(getOrderedKeys(templates, true)).toEqual(expected)
  })
})
