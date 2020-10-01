"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSlashResponse = buildSlashResponse;
exports.parseIndicoResponse = parseIndicoResponse;

var _api = _interopRequireDefault(require("./api"));

var _utils = require("./utils");

var _payload = _interopRequireDefault(require("./payload"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var res = yield (0, _api.default)(day).catch(e => (0, _utils.logError)(e));
    var results = parseIndicoResponse(res);
    var payload = new _payload.default(day, [results], false);
    var message = payload.assembled;
    return message;
  });
  return _buildSlashResponse.apply(this, arguments);
}