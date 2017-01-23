const webpack               = require('webpack');
const merge                 = require('webpack-merge');
const config                = require('./webpack.dll.base');

module.exports = merge(config, {
    output: {
        filename: '[name].dll.js',
    }
})
