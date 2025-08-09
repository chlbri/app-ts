'use strict';

var decompose = require('@bemedev/decompose');
var equal = require('fast-deep-equal');
var utils_environment = require('./environment.cjs');
var utils_merge = require('./merge.cjs');
var utils_nothing = require('./nothing.cjs');
var utils_objects_checkKeys = require('./objects/checkKeys.cjs');
var utils_reduceFnMap = require('./reduceFnMap.cjs');
var utils_resolve = require('./resolve.cjs');
var utils_strings_deleteFirst = require('./strings/deleteFirst.cjs');
var utils_strings_escapeRegExp = require('./strings/escapeRegExp.cjs');
var utils_strings_isStringEmpty = require('./strings/isStringEmpty.cjs');
var utils_strings_recomposeSV = require('./strings/recomposeSV.cjs');
var utils_strings_replaceAll = require('./strings/replaceAll.cjs');
var utils_toFunction = require('./toFunction.cjs');
var utils_typings = require('./typings.cjs');



Object.defineProperty(exports, "decompose", {
	enumerable: true,
	get: function () { return decompose.decompose; }
});
Object.defineProperty(exports, "decomposeSV", {
	enumerable: true,
	get: function () { return decompose.decomposeSV; }
});
Object.defineProperty(exports, "recompose", {
	enumerable: true,
	get: function () { return decompose.recompose; }
});
exports.deepEqual = equal;
exports.IS_PRODUCTION = utils_environment.IS_PRODUCTION;
exports.IS_TEST = utils_environment.IS_TEST;
exports.isCI = utils_environment.isCI;
exports.merge = utils_merge.merge;
exports.nothing = utils_nothing.nothing;
exports.checkKeys = utils_objects_checkKeys.checkKeys;
exports.reduceFnMap = utils_reduceFnMap.reduceFnMap;
exports.reduceFnMapReduced = utils_reduceFnMap.reduceFnMapReduced;
exports.toEventsMap = utils_reduceFnMap.toEventsMap;
exports.resolve = utils_resolve.resolve;
exports.deleteFirst = utils_strings_deleteFirst.deleteFirst;
exports.escapeRegExp = utils_strings_escapeRegExp.escapeRegExp;
exports.isStringEmpty = utils_strings_isStringEmpty.isStringEmpty;
exports.recomposeSV = utils_strings_recomposeSV.recomposeSV;
exports.replaceAll = utils_strings_replaceAll.replaceAll;
exports.toFunction = utils_toFunction.toFunction;
exports.typings = utils_typings.typings;
//# sourceMappingURL=index.cjs.map
