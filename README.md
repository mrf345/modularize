<h1 align='center'> Modularize </h1>
<h5 align='center'>Front-End utility to help in organizing large static websites.</h5>
<p align='center'>
  <a href='https://travis-ci.org/mrf345/modularize'> <img src='https://travis-ci.org/mrf345/modularize.svg?branch=master' alt='Build Status' /></a>
  <a href='https://coveralls.io/github/mrf345/modularize?branch=testing'><img src='https://coveralls.io/repos/github/mrf345/modularize/badge.svg?branch=testing' alt='Coverage Status' /></a>
  <a href='https://www.npmjs.com/package/@mrf3/modularize'><img src='https://img.shields.io/npm/v/@mrf3/modularize' /></a>
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
</p>

### Install:

##### NPM: to bundle it however you like:
- To install it:
`npm i @mrf3/modularize --save`
- To import it:
```javascript
// ES5
const Modularize = require('@mrf3/modularize').default

// ES6
import Modularize from '@mrf3/modularize'
```

##### Browser:
- You can get the latest bundle from [here](https://gitcdn.xyz/repo/mrf345/modularize/master/bin/Modularize.min.js)
- To Import it:
```html
<script src="https://gitcdn.xyz/repo/mrf345/modularize/master/bin/Modularize.min.js"></script>
<script>
  var Templates = new Modularize()
</script>
```

### Usage:
```javascript
var Templates = new Modularize(
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
)

// if the default options work for you out-of-the-box. this should load it:
Templates.load()
  .then(function(bundle) { console.log('All templates loaded:', bundle) })
  .catch(function(error) { console.warn(error) })
```

### Example:
This is a [live example](https://mrf345.github.io/modularize/) of a static website that's composed of two nested directories;
[`templates`](https://github.com/mrf345/modularize/tree/gh-pages/templates) and [`subtemplates`](https://github.com/mrf345/modularize/tree/gh-pages/subtemplates) each contains its own templates.

- Configuration used to achieve that in [`index.html`](https://github.com/mrf345/modularize/blob/gh-pages/index.html):
```javascript
var Templates = new Modularize(undefined, [
    {
      templatesPath: '/templates/',
      appendTo: 'body',
      data: {
        5: {adjective: 'Awesome'},
        '*': {date: new Date().toLocaleDateString()}
      }
    },
    {
      templatesPath: '/templates/subtemplates',
      appendTo: '.subTemplates',
      data: {
        1: {postfix: 'intro'},
        2: {postfix: 'info'},
        3: {postfix: 'footer'},
        '*': {var: ' cool '}
      }
    }
  ])
```
