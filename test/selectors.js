"use strict";
exports.__esModule = true;
var immutable_1 = require("immutable");
function createSelector(func) {
    return function (keyResolver, hashResolver) {
        var hashes = {};
        var results = {};
        var selector = function memoize(state) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var key = keyResolver.apply(void 0, [state].concat(args));
            var hash = hashResolver.apply(void 0, [state].concat(args));
            console.log(key, hash, hashes, results);
            if (hashes[key] !== hash) {
                results[key] = func.apply(void 0, [state].concat(args));
            }
            hashes[key] = hash;
            return results[key];
        };
        selector.removeKey = function (state) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var key = keyResolver.apply(void 0, [state].concat(args));
            delete hashes[key];
            delete results[key];
        };
        return selector;
    };
}
exports.createSelector = createSelector;
var state = immutable_1.fromJS({
    foo: 1,
    bar: {
        qux: 'hello'
    }
});
var selector = createSelector(function (state) { return ({ bar: "~~" + state.getIn(['bar', 'qux']) + "~~" }); })(function (state) { return state.get('foo'); }, function (state) { return state.get('bar'); });
var s1 = selector(state);
console.log(s1);
var s2 = selector(state);
console.log(s2 === s1);
state = state.set('foo', 2);
var s3 = selector(state);
console.log(s3 === s1);
state = state.set('foo', 1);
var s4 = selector(state);
console.log(s4 === s1);
state = state.setIn(['bar', 'qux'], 'goodbye');
var s5 = selector(state);
console.log(s5, s5 === s1);
