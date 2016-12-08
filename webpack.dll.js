const webpack               = require('webpack');
const path                  = require('path');

module.exports = {
    entry: {
        vendors: [
        ],
    },
    output: {
    },
    plugins: [
        new webpack.DllPlugin({
        })
    ]
}