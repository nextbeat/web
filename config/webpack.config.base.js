const webpack               = require('webpack');
const path                  = require('path');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');
const ManifestPlugin        = require('webpack-manifest-plugin');
const CommonsChunkPlugin    = webpack.optimize.CommonsChunkPlugin;
const DllReferencePlugin    = webpack.DllReferencePlugin;

let absolutePath = (p) => path.resolve(__dirname, '../client', p) 

module.exports = {
    entry: {
        app: './client/app.tsx'
    },
    output: {
        path: absolutePath('public')
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                exclude: /node_modules\/(?!(autotrack|dom-utils))/,
                loader: 'ts-loader'
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract({
                    use: [
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
                test: /\.(gif|png|jpe?g|svg)$/,
                loader: 'file-loader?name=./images/[hash:16].[ext]',
                exclude: /node_modules/
            },
            {
                test: /\.md$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'html-loader'
                    },
                    {
                        loader: 'markdown-loader'
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            "@client": absolutePath(''),
            "@actions": absolutePath('actions'),
            "@analytics": absolutePath('analytics'),
            "@components": absolutePath('components'),
            "@eddy": absolutePath('eddy'),
            "@errors": absolutePath('errors'),
            "@models": absolutePath('models'),
            "@reducers": absolutePath('reducers'),
            "@schemas": absolutePath('schemas'),
            "@types": absolutePath('types'),
            "@upload": absolutePath('upload'),
            "@utils": absolutePath('utils')
        },
        symlinks: false
    },
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