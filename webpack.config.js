const webpack               = require('webpack');
const path                  = require('path');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');

module.exports = {
    cache: true,
    devtool: 'eval',
    entry: {
        app: [
            // 'react-hot-loader/patch',
            // 'webpack-dev-server/client?http://localhost:3000',
            // 'webpack/hot/only-dev-server',
            './client/app.js'
        ],

    },
    output: {
        filename: 'bundle.webpack.js',
        path: path.join(__dirname, 'client/public/js'),
        publicPath: 'http://localhost:9090/'
    },
    devServer: {
        inline: true
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
                loader: 'file-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('main.webpack.css'),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('mac')
        }),
        // new webpack.HotModuleReplacementPlugin(),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false,
        //         'screw_ie8': true
        //     },
        //     output: {
        //         comments: false
        //     },
        //     sourceMap: false
        // }),
        // new webpack.LoaderOptionsPlugin({
        //     minimize: true,
        //     debug: false
        // }),
    ]
}