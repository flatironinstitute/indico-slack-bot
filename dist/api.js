"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _axios = _interopRequireDefault(require("axios"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * Queries Indico API for event info by date.
 * @param {string} day Date in ISO format.
 * @return {object} res Event info for specified date.
 */
function queryIndicoByDate(_x) {
  return _queryIndicoByDate.apply(this, arguments);
}

function _queryIndicoByDate() {
  _queryIndicoByDate = _asyncToGenerator(function* (day) {
    var formattedDay = (0, _moment.default)(day).format('YYYY-MM-DD');
    var queryUrl = "https://indico.flatironinstitute.org/export/categ/0.json?apikey=".concat(process.env.INDICO_KEY, "&from=").concat(formattedDay, "&to=").concat(formattedDay, "&pretty=yes");
    var res = yield _axios.default.get(queryUrl).catch(e => (0, _utils.logError)(e));
    return res.data;
  });
  return _queryIndicoByDate.apply(this, arguments);
}

var _default = {
  queryIndicoByDate
};
exports.default = _default;