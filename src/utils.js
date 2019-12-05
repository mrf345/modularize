module.exports = {
  setupElements (appendTo = 'modularize') {
    // assumes `window` and `document` are globally defined.
    const body = document.createElement('body')
    const div = document.createElement('div')
    div.classList.add(`${appendTo}`)
    body.appendChild(div)
    document.body = body
  },

  getOrderedKeys (obj = {}, reverse = false) {
    const keys = Object.keys(obj).sort((a, b) => a - b)

    return reverse ? keys.reverse() : keys
  },

  notEmpty (input) {
    if (Array.isArray(input)) return !!input.length
    else if (typeof input === 'object') return !!Object.keys(input).length
    else return !!input
  }
}
