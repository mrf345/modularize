import Modularize from './index'
import { fetch } from 'whatwg-fetch'
import { setupElements } from './utils'

jest.mock('whatwg-fetch')

function commonSetup (self, rejected = true) {
  self.templateContent = '<h1 class="testing">Resolved! {{ test }}</h1>'
  function text () { return self.templateContent } // strange js behaviour...
  self.mockResponse = { status: 200, text: text }
  rejected
    ? fetch.mockRejectedValue()
    : fetch.mockResolvedValue(self.mockResponse)
  setupElements()
  self.module = new Modularize(rejected ? undefined : { limit: 1 })

  self.getParents = () => Array.from(document.querySelectorAll(self.module.options.appendTo))
  self.getParsed = (value) => self.templateContent.replace('{{ test }}', value)
}

describe('Testing module main functionalities', () => {
  const self = {}

  beforeEach(() => commonSetup(self, false))

  it('test templates retrieved', () => {
    self.module.options.limit = 3

    expect.assertions(1)
    return self.module.load()
      .then(bundle => expect(bundle.templates).toEqual({
        1: self.templateContent,
        2: self.templateContent,
        3: self.templateContent
      }))
  })

  it('test templates content is parsed', () => {
    const values = ['Awesome', 'Spectacular', 'Fantastic']
    self.module.options.limit = 3
    self.module.options.data = {
      1: { test: values[0] },
      2: { test: values[1] },
      3: { test: values[2] }
    }

    expect.assertions(3)
    return self.module.load().then(bundle => {
      const { templates } = bundle

      expect(templates[1]).toBe(self.getParsed(values[0]))
      expect(templates[2]).toBe(self.getParsed(values[1]))
      expect(templates[3]).toBe(self.getParsed(values[2]))
    })
  })

  it('test templateContent is pushed to parents', () => {
    expect.assertions(1)
    return self.module.load().then(bundle => {
      self.getParents().forEach(ele => expect(ele.innerHTML).toBe(self.templateContent))
    })
  })

  it('test templateContent is parsed and pushed to parents', () => {
    const value = 'Awesome'
    self.module.options.data = { 1: { test: value } }

    expect.assertions(1)
    return self.module.load().then(bundle => {
      self.getParents().forEach(ele => expect(ele.innerHTML).toBe(self.getParsed(value)))
    })
  })

  it('test multiple templateContent is pushed to parents', () => {
    self.module.options.limit = 69

    expect.assertions(1)
    return self.module.load().then(bundle => {
      self.getParents().forEach(
        ele => expect(ele.innerHTML).toBe(self.templateContent.repeat(69)))
    })
  })

  it('test reversed multiple templateContent is pushed to parents', () => {
    const values = ['Awesome', 'Spectacular', 'Fantastic']
    self.module.options.limit = 3
    self.module.options.reverseOrder = true
    self.module.options.data = {
      1: { test: values[0] },
      2: { test: values[1] },
      3: { test: values[2] }
    }

    expect.assertions(1)
    return self.module.load().then(bundle => {
      self.getParents().forEach(
        ele => expect(ele.innerHTML).toBe(
          self.getParsed(values[2]) +
          self.getParsed(values[1]) +
          self.getParsed(values[0])
        ))
    })
  })

  it('test templates multiple options', () => {
    self.module.stackOptions = Array(10).fill()
      .map(i => self.module.getDefaultOptions({ limit: 4 }))

    expect.assertions(1)
    return self.module.load()
      .then(stack => {
        const templates = stack.map(bundle => bundle.templates)

        expect(templates).toEqual(Array(10).fill({
          1: self.templateContent,
          2: self.templateContent,
          3: self.templateContent,
          4: self.templateContent
        }))
      })
  })
})

describe('Testing module units and exceptions', () => {
  const self = {}

  beforeEach(() => commonSetup(self))

  test('test constructor default parameters', () => {
    expect(self.module.options.templatesPath).toBe('/templates/')
    expect(self.module.options.data).toEqual({})
    expect(self.module.options.appendTo).toBe('.modularize')
    expect(self.module.options.startsFrom).toEqual(1)
    expect(self.module.options.bypass).toEqual([])
    expect(self.module.options.extension).toBe('html')
    expect(self.module.options.reverseOrder).toEqual(false)
    expect(self.module.options.limit).toEqual(0)
  })

  it('test `load` promise failure', () => {
    const exception = TypeError('something went wrong')
    self.module.getDefaultOptions = () => { throw exception }

    return expect(self.module.load()).rejects.toEqual(exception)
  })
})
