const webpack               = require('webpack');
const path                  = require('path');

module.exports = {
    entry: {
        vendors: [ 
            'stanza.io',
            'react',
            'react-dom',
            'react-router',
            'react-redux',
            'redux',
            'redux-logger',
            'bluebird',
            'immutable'
        ]
    },
    output: {
        filename: '[name].dll.js',
        path: path.join(__dirname, '../client/public/js/'),
        library: '[name]'
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, '../client/public/js', '[name].manifest.json'),
            name: '[name]'
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
}