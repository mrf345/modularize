const { resolve } = require('path')
const MinifyPlugin = require('babel-minify-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        path:resolve(__dirname, 'bin'),
        filename: 'Modularize.min.js',
        library: 'Modularize',
        libraryTarget: 'window',
        libraryExport: 'default'
    },
    plugins: [new MinifyPlugin()],
    module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {loader: 'babel-loader'}
		}]
	},
}
