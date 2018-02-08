const webpack               = require('webpack');
const merge                 = require('webpack-merge');
const config                = require('./webpack.config.base');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');

module.exports = merge.smart(config, {
    cache: true,
    output: {
        filename: 'js/bundle.js',
        chunkFilename: 'js/[id].bundle.js',
        publicPath: 'http://localhost:9090/'
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ]
    },
    devtool: 'eval-source-map',
    devServer: {
        inline: true
    },
    plugins: [
        new ExtractTextPlugin('css/main.css'),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('mac')
        }),
    ]
});

