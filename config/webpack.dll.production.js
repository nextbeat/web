const webpack               = require('webpack');
const merge                 = require('webpack-merge');
const config                = require('./webpack.dll.base');

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = merge.smart(config, {
    output: {
        filename: '[name].[chunkhash].dll.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(nodeEnv)
        }),
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
