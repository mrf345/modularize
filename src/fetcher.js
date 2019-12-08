try { global.fetch = require('whatwg-fetch').fetch }
catch(e) { global.fetch = require('node-fetch').fetch }

export default class Fetcher {
  /* eslint-disable */
  error = Error('Failed to fetch templated.')
  reject = () => new Promise((r, reject) => reject(Fetcher.error))
  /* eslint-enable */

  constructor (options = {}, stackOptions = []) {
    this.options = options || {}
    this.stackOptions = stackOptions || []
    this.hasOptions = !!Object.keys(options).length
    this.hasStack = !!stackOptions.length

    if (this.hasOptions && !this.hasStack) this.stackOptions.push(this.options)
  }

  static fetchTemplates (options = {}) {
    const { parseContent } = require('./index').default
    const templates = {}

    return new Promise((resolve) => {
      (function recursTemplates (index) {
        const bypass = options.bypass.includes(`${index}.${options.extension}`)
        const hitLimit = options.limit && index >= options.limit
        const postfix = (options.data[index] || options.data['*'] || {}).postfix || ''

        const bundle = () => ({templates, options})
        const handleRejection = () => bypass
          ? recursTemplates(index + 1)
          : resolve(bundle())

        fetch(`${options.templatesPath}${index}${postfix}.${options.extension}`)
          .then(response => response.status === 200 ? response.text() : Fetcher.reject())
          .then(text => {
            templates[index] = parseContent(index, text, options.data)

            return hitLimit
              ? resolve(bundle())
              : recursTemplates(index + 1)
          }).catch(handleRejection)
      })(options.startsFrom)
    })
  }

  load () {
    return Promise.all(this.stackOptions.map((options) => {
      return Fetcher.fetchTemplates(options)
    })).then(stack => new Promise((resolve) => {
      return resolve(stack.length === 1 ? stack.pop() : stack)
    }))
  }
}
