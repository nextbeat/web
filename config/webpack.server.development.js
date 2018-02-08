const webpack               = require('webpack');
const merge                 = require('webpack-merge');
const serverConfig          = require('./webpack.server.base');

// Dumb workaround for different publicPath
// for file-loader when developing locally

module.exports = merge.smart(serverConfig, {
    module: {
        rules: [
            {
                test: /\.(gif|png|jpe?g|svg)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[hash:16].[ext]',
                            emitFile: false,
                            publicPath: 'http://localhost:9090/images/'
                        }
                    }
                ]
            },
        ]
    },
});
