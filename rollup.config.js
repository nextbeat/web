import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals'
import builtins from 'rollup-plugin-node-builtins'
import json from 'rollup-plugin-json'
import uglify from 'rollup-plugin-uglify'

export default {
    entry: 'client/app.js',
    dest: 'client/public/js/bundle.rollup.js',
    format: 'iife',
    plugins: [
        builtins(),
        babel({
            exclude: 'node_modules/**'
        }),
        resolve({
            jsnext: true,
            main: true,
            preferBuiltins: true
        }),
        commonjs({
            namedExports: {
                'node_modules/immutable/dist/immutable.js': [ 'Map', 'Set', 'List', 'fromJS', 'Iterable' ],
                'node_modules/react-dom/index.js': [ 'render', 'findDOMNode' ],
                'node_modules/react/react.js': [ 'PropTypes', 'createElement' ],
                'node_modules/node-uuid/uuid.js': [ 'v4' ]
            }
        }),
        globals(),
        json(),
        // uglify()
    ]
}