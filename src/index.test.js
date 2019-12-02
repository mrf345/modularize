import Modularize from './index'
import { JSDOM } from 'jsdom'

describe('Testing modules main functionalities', () => {
  const self = {}

  beforeEach(() => {
    self.templateContent = '<h1>Resolved! {{ test }}</h1>'
    self.mockFetchSuccess = new Promise(
      (resolve, reject) => resolve({ status: 200, text: () => self.templateContent }))
    self.mockFetchFail = new Promise((resolve, reject) => reject(TypeError()))
    // added another couple to test `.load()` while `autoLoad == true`
    self.fetchSideEffects = [
      self.mockFetchSuccess, self.mockFetchFail,
      self.mockFetchSuccess, self.mockFetchFail]
    self.mockDom = new JSDOM()
    global.fetch = () => self.fetchSideEffects.pop()
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
    const response = self.module.getTemplate(1)

    expect.assertions(2)
    expect(response).toMatchObject(self.mockFetchSuccess)
    return response.then(content => expect(content).toBe(self.templateContent))
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
    return expect(self.module.load()).resolves.toEqual('loaded')
  })

  it('test load promise failure', () => {
    const exception = TypeError('testing')
    self.module.getTemplate = () => { throw exception }
    return expect(self.module.load()).rejects.toEqual(exception)
  })
})
