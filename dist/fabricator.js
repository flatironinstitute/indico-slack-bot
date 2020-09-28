"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var Api = _interopRequireWildcard(require("./api"));

var _utils = require("./utils");

var _payload = _interopRequireDefault(require("./payload"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * Remove test events from Indico response object.
 * @param {object} res Indico event data API response.
 * @return {array} events Filtered event array.
 */
function parseIndicoResponse(res) {
  if (res.results) {
    var events = [];
    res.results.forEach(result => {
      if ( // eslint-disable-next-line no-prototype-builtins
      result.hasOwnProperty('category') && result.category.toLowerCase().indexOf('test') === -1) {
        events.push(result);
      }
    });
    return events;
  }

  return [];
}
/**
 * Function to gather Indico info and organize slash command response
 * @param {string} day Date in ISO format.
 * @return {object} payload Formatted blocks of a slack response.
 */


function buildSlashResponse(_x) {
  return _buildSlashResponse.apply(this, arguments);
}

function _buildSlashResponse() {
  _buildSlashResponse = _asyncToGenerator(function* (day) {
    // eslint-disable-next-line prettier/prettier
    var res = yield Api.queryIndicoByDate(day).catch(e => (0, _utils.logError)(e));
    var results = parseIndicoResponse(res);
    var payload = new _payload.default(day, [results], false);
    var message = payload.assemble();
    return message;
  });
  return _buildSlashResponse.apply(this, arguments);
}

var _default = {
  buildSlashResponse
};
exports.default = _default;