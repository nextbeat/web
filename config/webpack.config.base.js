const webpack               = require('webpack');
const path                  = require('path');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        app: './client/app.js'
    },
    output: {
        filename: 'js/bundle.js',
        chunkFilename: 'js/[id].bundle.js',
        path: path.join(__dirname, '../client/public/')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    babelrc: false,
                    presets: [
                        ['es2015', { modules: false }],
                        'react'
                    ],
                    plugins: [
                        'transform-object-rest-spread'
                    ]
                }
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract({
                    loader: [
                        'css-loader', 
                        'postcss-loader', 
                        'sass-loader'
                    ],
                })
            },
            {
                test: /\.(gif|png|jpe?g)$/,
                loader: 'file-loader?name=./images/[hash:16].[ext]',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('css/main.css')
    ]
}