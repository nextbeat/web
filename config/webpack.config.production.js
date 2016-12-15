const webpack   = require('webpack');
const merge     = require('webpack-merge');
const config    = require('./webpack.config.base');

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = merge(config, {
    output: {
        publicPath: '/'
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
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
    ]
});

