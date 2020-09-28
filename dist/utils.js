"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseIncomingDate = parseIncomingDate;
exports.formatTime = formatTime;
exports.logError = logError;
exports.catchErrors = void 0;

var chrono = _interopRequireWildcard(require("chrono-node"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Function to parse a string message for date information.
 * @param {string} message The string from slack command.
 * @return {string} day Date in ISO format or null if not found.
 */
function parseIncomingDate(message) {
  var day = chrono.parseDate(message, new Date(), {
    forwardDate: true
  });
  return day;
}
/**
 * Formats time into AM/PM without seconds
 * @param {string} time As hh:mm:ss.
 * @return {string} block Formatted time string.
 */


function formatTime(time) {
  var arr = time.split(':');
  var ftime = '';

  if (arr[0] === 12) {
    arr[2] = 'PM';
  } else if (arr[0] > 12) {
    arr[0] -= 12;
    arr[2] = 'PM';
  } else {
    arr[2] = 'AM';
  }

  if (arr[1] === '00') {
    ftime = "".concat(arr[0], " ").concat(arr[2]);
  } else {
    ftime = "".concat(arr[0], ":").concat(arr[1], " ").concat(arr[2]);
  }

  return ftime;
}
/**
 * Standard error logging function.
 * @param {any} error Any error function.
 */


function logError(error) {
  /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
  console.error('⚠️ Error: ', error);
  throw new Error(error);
}
/**
 * Wraps async functions to abstract out try/catch.
 * @param {function} fn Any asyncronous function.
 * @return {array} [res, err] Either response or error and undefined.
 */


var catchErrors = fn => {
  // eslint-disable-next-line prettier/prettier
  return fn.then(res => [res, undefined]).catch(error => Promise.resolve([undefined, error]));
};

exports.catchErrors = catchErrors;