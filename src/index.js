import '@babel/polyfill'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'
const { window } = new JSDOM('<div class="modularize"></div>')
const { document } = window

export default class Modularize {
  /**
     * Utility to help import html templates and parse them minimally.
     * @param {string} templatesPath path where the templates are stored.
     * @param {object} data data to parse the template with.
     * @param {string} appendTo parent element selector to insert templates under.
     * @param {integer} startsFrom index number to start descending from.
     * @param {array} bypass array of index numbers to skip.
     * @param {string} extension the template file extension.
     * @param {boolean} autoLoad load the templates automatically on initiation.
     *
     * `data` I.E: {1: {var1: 'something', name: 'something else'}, ...}
     *  NOTE: if data is meant to be global then use '*' as a key instead of
     *        the template index number `1`.
     */
  constructor (
    templatesPath = '/templates', data = {}, appendTo = '.modularize',
    startsFrom = 1, bypass = [], extension = 'html', autoLoad = true
  ) {
    this.templatesPath = templatesPath
    this.data = data
    this.appendTo = appendTo
    this.startsFrom = startsFrom
    this.bypass = bypass
    this.extension = extension
    this.parents = []

    if (!this.templatesPath.endsWith('/')) this.templatesPath += '/'

    if (autoLoad) {
      if (document.readyState === 'complete') this.recursAndParseTemplates()
      else window.addEventListener('load', () => this.recursAndParseTemplates())
    }
  }

  getTemplate (index) {
    return new Promise((resolve, reject) => {
      fetch(`${this.templatesPath}${index}.${this.extension}`)
        .then(r => resolve(r.status === 200 ? r.text() : undefined))
        .catch(e => resolve(undefined))
    })
  }

  parseContent (index, content) {
    const indexData = this.data[index] || this.data['*']
    const pattern = /(?<=\{{).+?(?=}})/g
    let parsedContent = content

    indexData && (function recursMatches () {
      const match = (pattern.exec(parsedContent) || [])[0]

      if (match) {
        const matchValue = indexData[match.trim()]

        if (matchValue) parsedContent = parsedContent.replace(`{{${match}}}`, matchValue)
        recursMatches()
      }
    })()

    return parsedContent
  }

  recursAndParseTemplates (index, resolve) {
    index = index || this.startsFrom
    resolve = resolve || Function
    this.parents = document.querySelectorAll(this.appendTo)

    this.getTemplate(index)
      .then(content => {
        const bypass = this.bypass.includes(`${index}.${this.extension}`)

        content && !bypass && this.parents.forEach(
          e => { e.innerHTML += this.parseContent(index, content) })
        if (content || bypass) this.recursAndParseTemplates(index + 1, resolve)
        else resolve('loaded')
      })
  }

  load () {
    return new Promise((resolve, reject) => {
      try {
        this.recursAndParseTemplates(0, resolve)
      } catch (e) { reject(e) }
    })
  }
}
