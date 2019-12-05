export default class Fetcher {
  constructor (options = {}, stackOptions = []) {
    this.options = options || {}
    this.stackOptions = stackOptions || []
    this.hasOptions = !!Object.keys(options).length
    this.hasStack = !!stackOptions.length

    if (this.hasOptions && !this.hasStack) this.stackOptions.push(this.options)
  }

  static fetchTemplates (options = {}) {
    const fetch = require('node-fetch')
    const { parseContent } = require('./index').default
    const templates = {}

    return new Promise((resolve) => {
      (function recursTemplates (index) {
        const bypass = options.bypass.includes(`${index}.${options.extension}`)
        const hitLimit = options.limit && index >= options.limit
        const postfix = options.data.postfix || ''

        function handleRejection (error) {
          console.warn(error)

          return bypass
            ? recursTemplates(index + 1) : resolve(templates)
        }

        fetch(`${options.templatesPath}${index}${postfix}.${options.extension}`)
          .then(r => {
            if (r.status === 200) {
              templates[index] = parseContent(index, r.text(), options.data)

              return hitLimit
                ? resolve(templates) : recursTemplates(index + 1)
            } else handleRejection(Error('Failed to fetch template.'))
          }).catch(handleRejection)
      })(options.startsFrom)
    })
  }

  load () {
    return Promise.all(this.stackOptions.map((options) => {
      options.limit = options.limit * this.stackOptions.length

      return Fetcher.fetchTemplates(options)
    })).then(stack => new Promise((resolve) => {
      return resolve(stack.length === 1 ? stack.pop() : stack)
    }))
  }
}
