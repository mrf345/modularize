const { resolve } = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: resolve(__dirname, 'bin'),
    filename: 'Modularize.min.js',
    library: 'Modularize',
    libraryTarget: 'window',
    libraryExport: 'default'
  },
  plugins: [],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: { loader: 'babel-loader' }
    }]
  }
}
