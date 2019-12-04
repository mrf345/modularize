
<p align='center'>
  <h1> Modularize </h1>

  <a href='https://travis-ci.org/mrf345/modularize'> <img src='https://travis-ci.org/mrf345/modularize.svg?branch=master' alt='Build Status' /></a>
  <a href='https://coveralls.io/github/mrf345/modularize?branch=testing'><img src='https://coveralls.io/repos/github/mrf345/modularize/badge.svg?branch=testing' alt='Coverage Status' /></a>
  <a href='https://www.npmjs.com/package/@mrf3/modularize'><img src='https://img.shields.io/npm/v/@mrf3/modularize' /></a>
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
</p>

#### Install:
`npm i @mrf3/modularize --save`

#### Usage:
```javascript
// ES5
const Modularize = require('@mrf3/modularize').default

// ES6
import Modularize from '@mrf3/modularize'

const templates = new Modularize(
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
    '/templates', {}, '.modularize', 1, [], 'html', false, false, 0
)

templates.load()
  .then(r => console.log('all templates loaded.'))
  .catch(e => console.warn(e))
```


#### TODO:
- [x] add travis and coveralls
- [x] setup webpack and build compatible bins link with CDN in bin/*
- [x] setup standard js linting and lint code
- [x] babel building packages. and git-ignore the lib/*
- [x] add usage and installation. refactor front-end and link it.
