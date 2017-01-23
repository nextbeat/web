const webpack               = require('webpack');
const merge                 = require('webpack-merge');
const config                = require('./webpack.config.base');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');


module.exports = merge(config, {
    cache: true,
    output: {
        filename: 'js/bundle.js',
        chunkFilename: 'js/[id].bundle.js',
    },
    devtool: 'source-map',
    devServer: {
        inline: true
    },
    output: {
         publicPath: 'http://localhost:9090/'
    },
    plugins: [
        new ExtractTextPlugin('css/main.css'),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('mac')
        }),
    ]
});

