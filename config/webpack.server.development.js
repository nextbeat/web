const webpack               = require('webpack');
const merge                 = require('webpack-merge');
const serverConfig          = require('./webpack.config.base');

module.exports = merge(config, {
    cache: true,
    output: {
        filename: 'js/bundle.js',
        chunkFilename: 'js/[id].bundle.js',
        publicPath: 'http://localhost:9090/'
    },
    module: {
        rules: [
            {
                
            }
        ]
    },
});

