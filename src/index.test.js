import Modularize from './index'
import fetch from 'node-fetch'
import { setupElements } from './utils'

jest.mock('node-fetch')

function commonSetup (self, rejected = true) {
  self.templateContent = '<h1 class="testing">Resolved! {{ test }}</h1>'
  function text () { return self.templateContent } // strange js behaviour...
  self.mockResponse = { status: 200, text: text }
  rejected
    ? fetch.mockRejectedValue()
    : fetch.mockResolvedValue(self.mockResponse)
  setupElements()
  self.module = new Modularize(rejected ? undefined : { limit: 1 })

  self.getParents = () => Array.from(document.querySelectorAll(self.module.appendTo))
  self.getParsed = (value) => self.templateContent.replace('{{ test }}', value)
}

describe('Testing module main functionalities', () => {
  const self = {}

  beforeEach(() => commonSetup(self, false))

  it('test templates retrieved', () => {
    self.module.limit = 3

    expect.assertions(1)
    return self.module.load()
      .then(templates => expect(templates).toEqual({
        1: self.templateContent,
        2: self.templateContent,
        3: self.templateContent
      }))
  })

  it('test templates content is parsed', () => {
    const values = ['Awesome', 'Spectacular', 'Fantastic']
    self.module.limit = 3
    self.module.data = {
      1: { test: values[0] },
      2: { test: values[1] },
      3: { test: values[2] }
    }

    expect.assertions(3)
    return self.module.load().then(templates => {
      expect(templates[1]).toBe(self.getParsed(values[0]))
      expect(templates[2]).toBe(self.getParsed(values[1]))
      expect(templates[3]).toBe(self.getParsed(values[2]))
    })
  })

  it('test templateContent is pushed to parents', () => {
    expect.assertions(1)
    return self.module.load().then(templates => {
      self.getParents().forEach(ele => expect(ele.innerHTML).toBe(self.templateContent))
    })
  })

  it('test templateContent is parsed and pushed to parents', () => {
    const value = 'Awesome'
    self.module.data = { 1: { test: value } }

    expect.assertions(1)
    return self.module.load().then(templates => {
      self.getParents().forEach(ele => expect(ele.innerHTML).toBe(self.getParsed(value)))
    })
  })

  it('test multiple templateContent is pushed to parents', () => {
    self.module.limit = 69

    expect.assertions(1)
    return self.module.load().then(templates => {
      self.getParents().forEach(
        ele => expect(ele.innerHTML).toBe(self.templateContent.repeat(69)))
    })
  })

  it('test reversed multiple templateContent is pushed to parents', () => {
    const values = ['Awesome', 'Spectacular', 'Fantastic']
    self.module.limit = 3
    self.module.reverse = true
    self.module.data = {
      1: { test: values[0] },
      2: { test: values[1] },
      3: { test: values[2] }
    }

    expect.assertions(1)
    return self.module.load().then(templates => {
      self.getParents().forEach(
        ele => expect(ele.innerHTML).toBe(
          self.getParsed(values[2]) +
          self.getParsed(values[1]) +
          self.getParsed(values[0])
        ))
    })
  })

  it('test templates multiple options', () => {
    self.module.stackOptions = Array(3).fill()
      .map(i => self.module.getDefaultOptions({ limit: 3 }))

    expect.assertions(1)
    return self.module.load()
      .then(templates => expect(templates).toEqual(Array(3).fill({
        1: self.templateContent,
        2: self.templateContent,
        3: self.templateContent
      })))
  })
})

describe('Testing module units and exceptions', () => {
  const self = {}

  beforeEach(() => commonSetup(self))

  test('test constructor default parameters', () => {
    expect(self.module.templatesPath).toBe('/templates/')
    expect(self.module.data).toEqual({})
    expect(self.module.appendTo).toBe('.modularize')
    expect(self.module.startsFrom).toEqual(1)
    expect(self.module.bypass).toEqual([])
    expect(self.module.extension).toBe('html')
    expect(self.module.reverse).toEqual(false)
    expect(self.module.limit).toEqual(0)
  })

  it('test `load` promise failure', () => {
    const exception = TypeError('something went wrong')
    self.module.getDefaultOptions = () => { throw exception }

    return expect(self.module.load()).rejects.toEqual(exception)
  })
})
