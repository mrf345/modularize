import { fetch } from 'node-fetch'
import { JSDOM } from 'jsdom'
const { window } = new JSDOM('<dev class="modularize"></div>')
const { document } = window


export class Modularize {
    /**
     * Utility to help import html templates and parse them minimally.
     * @param {string} templatesPath path where the templates are stored.
     * @param {object} data data to parse the template with.
     * @param {string} appendTo parent element selector to insert templates under.
     * @param {integer} startsFrom index number to start descending from.
     * @param {array} bypass array of index numbers to skip.
     * @param {string} extension the template file extension.
     * 
     * `data` I.E: {1: {var1: 'something', name: 'something else'}, ...}
     *  NOTE: if data is meant to be global then use '*' as a key instead of
     *        the template index number `1`.
     */
    constructor(templatesPath, data, appendTo, startsFrom, bypass, extension) {
        this.templatesPath = templatesPath || '/templates'
        this.data = data || {}
        this.appendTo = appendTo || '.modularize'
        this.startsFrom = startsFrom || 1
        this.bypass = bypass || []
        this.extension = extension || 'html'
        this.parents = []

        if (!this.templatesPath.endsWith('/')) this.templatesPath += '/'
        if (document.readyState == 'complete') this.recursAndParseTemplates()
        else window.addEventListener('load', () => this.recursAndParseTemplates())
    }

    getTemplate(index) {
        return new Promise((resolve, reject) => {
            fetch(`${this.templatesPath}${index}.${this.extension}`)
                .then(r => resolve(r.status == 200 ? r.text() : undefined))
                .catch(e => resolve(undefined))
        })
    }

    parseContent(index, content) {
        const indexData = this.data[index] || this.data['*']
        const pattern = /(?<=\{{).+?(?=}})/g
        let parsedContent = content, match, matchValue

        if (indexData) while (true) {
            match = (pattern.exec(parsedContent) || [])[0]

            if (match) {
                matchValue = indexData[match.trim()]
                if (matchValue) parsedContent = parsedContent.replace(`{{${match}}}`, matchValue)
            } else break
        }

        return parsedContent
    }

    recursAndParseTemplates(index=this.startsFrom) {
        this.parents = document.querySelectorAll(this.appendTo)

        this.getTemplate(index)
            .then(content => {
                const bypass = this.bypass.includes(`${index}.${this.extension}`)

                if (content && !bypass) this.parents.forEach(
                    e => e.innerHTML += this.parseContent(index, content))
                if (content || bypass) this.recursAndParseTemplates(index + 1)
            })
    }

}
