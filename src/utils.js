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
  }
}
