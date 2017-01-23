const webpack               = require('webpack');
const merge                 = require('webpack-merge');
const config                = require('./webpack.dll.base');

module.exports = merge(config, {
    output: {
        filename: '[name].[chunkhash].dll.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                'screw_ie8': true
            },
            output: {
                comments: false
            },
            sourceMap: false
        })
    ]
})
