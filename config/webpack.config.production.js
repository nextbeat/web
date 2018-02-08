const webpack               = require('webpack');
const merge                 = require('webpack-merge');
const config                = require('./webpack.config.base');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');
const ManifestPlugin        = require('webpack-manifest-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = merge.smart(config, {
    output: {
        filename: 'js/bundle.[chunkhash].js',
        chunkFilename: 'js/[id].bundle.[chunkhash].js',
        publicPath: '/'
    },
    plugins: [
        new ExtractTextPlugin('css/main.[contenthash].css'),
        new ManifestPlugin({
            fileName: 'js/app.cache.manifest.json'
        }),
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

