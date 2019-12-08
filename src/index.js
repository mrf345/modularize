import '@babel/polyfill'
import { JSDOM } from 'jsdom'
import { getOrderedKeys, setupElements, notEmpty } from './utils'
import Fetcher from './fetcher'

if (JSDOM) {
  // failsafe JSDOM in browsers
  global.window = new JSDOM('<div class="modularize"></div>').window
  global.document = window.document
  setupElements()
}

export default class Modularize {
  /**
     * Utility to help import html templates and parse them minimally.
     * @param {object} options contains the module options.
     * @param {array} stackOptions array of objects containing the module options.
     *
     * NOTE: when `stackOptions` is used `options` will be nullified.
     *`options` = {
     *  templatesPath: '/templates', // path where the templates are stored.
     *  data: {}, // data to parse the template with.
     *  appendTo: '.modularize', // element's selector to insert templates under.
     *  startsFrom: 1, // index number to start descending from.
     *  limit: 0, // limit to the number of templates to load.
     *  bypass: [], // array of index numbers to skip.
     *  extension: 'html', // the template file extension.
     *  reverseOrder: false,  // to reverse the order of displaying templates.
     * }
     *
     * `data` I.E: {1: {var1: 'something', name: 'something else'}, ...}
     *  NOTE: data to parse the template with. if data is meant to be global
     *        then use '*' as a key instead of the template index number `1`.
     */
  constructor (options = {}, stackOptions = []) {
    this.options = this.getDefaultOptions(options)
    this.stackOptions = stackOptions || []
    this.stackOptions = this.getDefaultStack()
  }

  getDefaultOptions (options) {
    options = options || this.options
    options.templatesPath = options.templatesPath || '/templates'
    options.appendTo = options.appendTo || '.modularize'
    options.data = notEmpty(options.data) ? options.data : {}
    options.startsFrom = options.startsFrom || 1
    options.limit = options.limit || 0
    options.bypass = options.bypass || []
    options.extension = options.extension || 'html'
    options.reverseOrder = options.reverseOrder || false

    if (!options.templatesPath.endsWith('/')) options.templatesPath += '/'
    Object.keys(options.data).forEach(key => {
      const { postfix } = options.data[key] || {}
      if (postfix && !postfix.startsWith('_')) options.data[key].postfix = '_' + postfix
    })

    return options
  }

  getDefaultStack () {
    return this.stackOptions.map(options => this.getDefaultOptions(options))
  }

  static parseContent (index = 0, content = '', data = {}) {
    const indexData = data[index] || data['*']
    const pattern = /{{.+?}}/g
    let parsedContent = content

    if (data[index] && data['*']) Object.assign(indexData, data['*'])
    indexData && (function recursMatches () {
      const match = (pattern.exec(parsedContent) || [])[0]

      if (match) {
        const cleanMatch = match.replace('{{', '').replace('}}', '').trim()
        const matchValue = indexData[cleanMatch]

        if (matchValue) parsedContent = parsedContent.replace(`${match}`, matchValue)
        recursMatches()
      }
    })()

    return parsedContent
  }

  pushTemplates (templates = {}, options = {}) {
    const keys = getOrderedKeys(templates, options.reverseOrder)
    const parents = document.querySelectorAll(options.appendTo)

    keys.forEach(key => {
      const content = templates[key]

      content && Array(parents.length).fill().forEach((_, index) => {
        if (parents[index]) parents[index].innerHTML += content
      })
    })
  }

  load () {
    return new Promise((resolve, reject) => {
      try {
        new Fetcher(this.getDefaultOptions(), this.getDefaultStack())
          .load().then(bundleOrBundles => {
            bundleOrBundles.length
              ? bundleOrBundles.forEach(bundle =>
                this.pushTemplates(bundle.templates, bundle.options))
              : this.pushTemplates(bundleOrBundles.templates, bundleOrBundles.options)
            resolve(bundleOrBundles)
          })
      } catch (e) { reject(e) }
    })
  }
}
