const webpack           = require('webpack');
const merge             = require('webpack-merge');
const config            = require('./webpack.config.base');

module.exports = merge(config, {
    cache: true,
    devtool: 'source-map',
    devServer: {
        inline: true
    },
    output: {
         publicPath: 'http://localhost:9090/'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('mac')
        }),
    ]
});

