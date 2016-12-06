const webpack               = require('webpack');
const path                  = require('path');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');

module.exports = {
    entry: './client/app.js',
    output: {
        filename: 'bundle.webpack.js'
        path: path.join(__dirname, 'client/public/js')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract({ loader: 'css-loader' })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('public/css/main.webpack.css')
    ]
}