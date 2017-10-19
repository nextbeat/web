"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var immutable_1 = require("immutable");
var reselect_1 = require("reselect");
function StateModelFactory(keyMap, keyMapPrefix, entityName) {
    var StateModel = /** @class */ (function () {
        function StateModel() {
        }
        StateModel.get = function (state, key, defaultValue) {
            return state.getIn(this.keyPath(key), defaultValue);
        };
        // static getPaginatedEntities(state: State, key: string): List<State> | null {
        //     const keyPath = keyMapPrefix.concat(['pagination', key, 'ids'])
        //     const ids = state.getIn(keyPath, List()) as List<number>
        //     return ids.map(id => {
        //         // todo: static getEntity for pagination key
        //         return this.getEntity(state, id.toString()) as State
        //     })
        // }
        StateModel.keyPath = function (key) {
            var path = keyMap[key];
            if (keyMapPrefix.length > 0) {
                path = keyMapPrefix.concat(path);
            }
            return path;
        };
        // static getEntity(state: State, id: string): State | null {
        //     if (!entityName) {
        //         return null
        //     }
        //     return state.getIn(['entities', entityName, id]) || null
        // }
        StateModel.getEntity = reselect_1.createSelector(function (state) {
            var id = StateModel.get(state, 'id');
            return state.getIn(['entities', entityName, id.toString()]);
        }, function (entity) { return ({ entity: entity }); } // todo: entity class wrapper
        );
        return StateModel;
    }());
    return StateModel;
}
var sectionKeyMap = {
    // meta
    'isFetching': ['meta', 'isFetching'],
    'name': ['meta', 'name']
};
var sectionKeyMapPrefix = ['pages', 'section'];
var Section = /** @class */ (function (_super) {
    __extends(Section, _super);
    function Section() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Section.getPrettyName = reselect_1.createSelector(function (state) { return Section.get(state, 'name'); }, function (name) { return ({ name: "~" + name + "~" }); });
    return Section;
}(StateModelFactory(sectionKeyMap, sectionKeyMapPrefix)));
var roomKeyMap = {
    'title': ['title'],
    'commentIds': ['pagination', 'comments', 'ids']
};
var Room = /** @class */ (function () {
    function Room() {
    }
    Room.keyPath = function (id, key) {
        return ['rooms', id.toString()].concat(roomKeyMap[key]);
    };
    Room.get = function (state, id, key, defaultValue) {
        return state.getIn(this.keyPath(id, key), defaultValue);
    };
    Room.getComments = reselect_1.createSelector(function (state, id) { return Room.get(state, id, 'commentIds', immutable_1.List()); }, function (ids) { return ids.map(function (id) { return ({ comment: state.getIn(['entities', 'comments', id.toString()]).toJS() }); }); });
    return Room;
}());
// Test
var state = immutable_1.fromJS({
    entities: {
        comments: {
            '1': {
                message: 'foo'
            },
            '2': {
                message: 'bar'
            },
            '3': {
                message: 'qux'
            },
            '4': {
                message: 'abc'
            }
        }
    },
    rooms: {
        '1': {
            title: 'New Room',
            pagination: {
                comments: {
                    ids: [1, 2]
                }
            }
        },
        '2': {
            pagination: {
                comments: {
                    ids: [3, 4]
                }
            }
        }
    },
    pages: {
        section: {
            meta: {
                isFetching: false,
                name: 'featured'
            }
        }
    }
});
console.log(Section.get(state, 'name'), Section.getPrettyName(state));
var c1 = Room.getComments(state, 1);
var c2 = Room.getComments(state, 2);
var c1b = Room.getComments(state, 1);
console.log(Room.get(state, 1, 'title'), c1 === c2, c1 === c1b);
