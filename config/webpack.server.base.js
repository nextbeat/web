const webpack               = require('webpack');
const path                  = require('path');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');
const ManifestPlugin        = require('webpack-manifest-plugin');
const nodeExternals         = require('webpack-node-externals');
const CommonsChunkPlugin    = webpack.optimize.CommonsChunkPlugin;
const DllReferencePlugin    = webpack.DllReferencePlugin;

let absolutePath = (p) => path.resolve(__dirname, '../client', p) 

module.exports = {
    entry: {
        app: './server/server.ts'
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'bundle.js',
        chunkFilename: 'js/[id].bundle.js',
        publicPath: 'http://localhost:9090/'
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules\/(?!(autotrack|dom-utils))/,
                loader: 'babel-loader',
                query: {
                    babelrc: false,
                    presets: [
                        ['es2015'],
                        'react'
                    ],
                    plugins: [
                        'transform-object-rest-spread'
                    ]
                }              
            },
            {
                test: /\.js$/,
                include: /node_modules\/lodash/,
                loader: 'babel-loader',
                query: {
                    babelrc: false,
                    plugins: [
                        'babel-plugin-transform-es2015-modules-commonjs'
                    ]
                }
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            query: { importLoaders: 2 }
                        },
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
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            "@client": absolutePath(''),
            "@actions": absolutePath('actions'),
            "@analytics": absolutePath('analytics'),
            "@components": absolutePath('components'),
            "@eddy": absolutePath('eddy'),
            "@errors": absolutePath('errors'),
            "@models": absolutePath('models'),
            "@reducers": absolutePath('reducers'),
            "@schemas": absolutePath('schemas'),
            "@types": absolutePath('types'),
            "@upload": absolutePath('upload'),
            "@utils": absolutePath('utils')
        },
        symlinks: false
    },
    target: 'node',
    node: {
        __dirname: false,
        process: false
    },
    externals: [ nodeExternals({
        whitelist: [/^lodash/]
    }) ],    
    plugins: [
        new CommonsChunkPlugin({
            name: 'server',
            children: true,
            async: true,
            minChunks: 3
        })
    ]
}