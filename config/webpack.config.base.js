const webpack               = require('webpack');
const path                  = require('path');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');
const ManifestPlugin        = require('webpack-manifest-plugin');
const CommonsChunkPlugin    = webpack.optimize.CommonsChunkPlugin;
const DllReferencePlugin    = webpack.DllReferencePlugin;

let absolutePath(p) => path.resolve(__dirname, '../client', p) 

module.exports = {
    entry: {
        app: './client/app.js'
    },
    output: {
        path: absolutePath('public')
    },
    module: {
        rules: [
            {
                test: /\.(j|t)s$/,
                exclude: /node_modules\/(?!(autotrack|dom-utils))/,
                loader: 'awesome-typescript-loader',
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract({
                    loader: [
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
        alias: {
            '@client': absolutePath('')
            '@actions': absolutePath('actions'),
            '@components': absolutePath('components'),
            '@models': absolutePath('models'),
            '@reducers': absolutePath('reducers'),
            '@schemas': absolutePath('schemas')
        }
    }
    plugins: [
        new DllReferencePlugin({
            context: process.cwd(),
            manifest: require(path.join(__dirname, '../client/public/js', 'vendors.manifest.json'))
        }),
        new CommonsChunkPlugin({
            name: 'app',
            children: true,
            async: true,
            minChunks: 3
        })
    ]
}