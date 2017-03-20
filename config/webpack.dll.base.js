const webpack               = require('webpack');
const path                  = require('path');
const ManifestPlugin        = require('webpack-manifest-plugin');

module.exports = {
    entry: {
        vendors: [ 
            'jquery',
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
        path: path.join(__dirname, '../client/public/js/'),
        library: '[name]'
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, '../client/public/js', '[name].manifest.json'),
            name: '[name]'
        }),
        new ManifestPlugin({
            fileName: 'vendors.cache.manifest.json'
        })
    ]
}