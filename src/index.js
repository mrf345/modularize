import '@babel/polyfill'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'
import { getOrderedKeys, setupElements } from './utils'

if (JSDOM) {
  // failsafe JSDOM in browsers
  global.window = new JSDOM('<div class="modularize"></div>').window
  global.document = window.document
  setupElements()
}

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
     * @param {boolean} reverse to reverse the order of displaying templates.
     * @param {integer} limit limit to the number of templates to load.
     *
     * `data` I.E: {1: {var1: 'something', name: 'something else'}, ...}
     *  NOTE: if data is meant to be global then use '*' as a key instead of
     *        the template index number `1`.
     */
  constructor (
    templatesPath = '/templates', data = {}, appendTo = '.modularize', startsFrom = 1,
    bypass = [], extension = 'html', autoLoad = false, reverse = false, limit = 0
  ) {
    this.templatesPath = templatesPath
    this.data = data
    this.appendTo = appendTo
    this.startsFrom = startsFrom
    this.bypass = bypass
    this.extension = extension
    this.reverse = reverse
    this.limit = limit
    this.templates = {}

    if (!this.templatesPath.endsWith('/')) this.templatesPath += '/'

    if (autoLoad) {
      if (document.readyState === 'complete') this.load()
      else window.addEventListener('load', () => this.load())
    }
  }

  parseContent (index = 0, content = '') {
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

  getTemplate (index = 0) {
    return new Promise((resolve, reject) => {
      fetch(`${this.templatesPath}${index}.${this.extension}`)
        .then(r => r.status === 200
          ? resolve(this.parseContent(index, r.text()))
          : reject(Error('failed to get valid response'))
        ).catch(e => reject(e))
    })
  }

  getTemplates () {
    return new Promise((resolve, reject) => {
      const templates = {};

      (function recursTemplates (index, self) {
        const bypass = self.bypass.includes(`${index}.${self.extension}`)
        const hitLimit = self.limit && index >= self.limit

        self.getTemplate(index)
          .then(content => {
            templates[index] = content

            return hitLimit
              ? resolve(templates) : recursTemplates(index + 1, self)
          }).catch(error => {
            console.warn(error)

            return bypass
              ? recursTemplates(index + 1, self) : resolve(templates)
          })
      })(this.startsFrom, this)
    })
  }

  pushTemplates () {
    const parents = document.querySelectorAll(this.appendTo)
    const keys = getOrderedKeys(this.templates, this.reverse)

    keys.forEach(key => {
      const content = this.templates[key]

      if (content) parents.forEach(ele => { ele.innerHTML += content })
    })
  }

  load () {
    return new Promise((resolve, reject) => {
      try {
        this.getTemplates()
          .then(templates => {
            this.templates = templates
            this.pushTemplates()
            resolve(this.templates)
          })
      } catch (e) { reject(e) }
    })
  }
}
