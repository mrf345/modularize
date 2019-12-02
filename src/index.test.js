import Modularize from './index'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

jest.mock('node-fetch')

describe('Testing modules main functionalities', () => {
  const self = {}

  beforeEach(() => {
    self.templateContent = '<h1>Resolved! {{ test }}</h1>'
    function text () { return self.templateContent } // strange js behaviour...
    self.mockResponse = { status: 200, text: text }
    self.mockDom = new JSDOM()
    fetch.mockRejectedValue()
    global.window = self.mockDom.window
    global.document = global.window.document

    const body = document.createElement('body')
    const div = document.createElement('div')
    div.classList.add('modularize')
    body.appendChild(div)
    document.body = body
    self.module = new Modularize()
  })

  test('test constructor default parameters', () => {
    expect(self.module.templatesPath).toBe('/templates/')
    expect(self.module.data).toMatchObject({})
    expect(self.module.appendTo).toBe('.modularize')
    expect(self.module.startsFrom).toBe(1)
    expect(self.module.bypass).toEqual([])
    expect(self.module.extension).toBe('html')
  })

  it('test getTemplate', () => {
    fetch.mockResolvedValue(self.mockResponse)
    expect.assertions(1)
    return expect(self.module.getTemplate(1)).resolves.toBe(self.templateContent)
  })

  it('test getTemplate falsy status', () => {
    self.mockResponse.status = 400
    fetch.mockResolvedValue(self.mockResponse)
    expect.assertions(1)
    return expect(self.module.getTemplate(1)).resolves.toBe(undefined)
  })

  test('parse parseContent', () => {
    const replacedValue = 'Awesome'
    self.module.data = { '*': { test: replacedValue } }
    const parsedContent = self.module.parseContent(1, self.templateContent)

    expect(parsedContent).toBe(self.templateContent.replace('{{ test }}', replacedValue))
  })

  it('test template parent selector', () => {
    expect.assertions(2)
    expect(self.module.parents.length).toEqual(1)
    self.module.parents.forEach(
      p => expect(p.className.includes(self.module.appendTo.slice(1))).toBeTruthy())
  })

  it('test load promise success', () => {
    expect.assertions(1)
    return expect(self.module.load()).resolves.toEqual('loaded')
  })

  it('test load promise failure', () => {
    const exception = TypeError('testing')
    self.module.getTemplate = () => { throw exception }

    expect.assertions(1)
    return expect(self.module.load()).rejects.toEqual(exception)
  })
})
