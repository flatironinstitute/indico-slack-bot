"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseIncomingDate = parseIncomingDate;
exports.formatTime = formatTime;
exports.logError = logError;
exports.convertHtmltoPlainText = convertHtmltoPlainText;
exports.getCenterImageUrl = getCenterImageUrl;
exports.catchErrors = void 0;

var chrono = _interopRequireWildcard(require("chrono-node"));

var HtmlToPlainText = _interopRequireWildcard(require("./htmltoplaintext"));

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
  return fn.then(res => [res, undefined]).catch(error => Promise.resolve([undefined, error]));
};
/**
 * Converts HTML descriptions into plain text.
 * @param {string} description HTML as a string.
 * @return {string} plaintext Formatted for slack.
 */


exports.catchErrors = catchErrors;

function convertHtmltoPlainText(description) {
  var textVersion = HtmlToPlainText.convert(description).split('\n');
  var plaintext = textVersion[0].slice(0, 140);
  return plaintext;
}
/**
 * Provides image url for center-specific image.
 * @param {object} result Indico results object.
 * @return {string} block Formatted cloudinary url.
 */


function getCenterImageUrl(result) {
  var imageUrl = 'v1599011059/fi_a0ovmj.png';
  var keywordArr = result.keywords;

  if (keywordArr.length) {
    var cat = keywordArr[0].toLowerCase();

    switch (true) {
      case cat.includes('cca'):
        imageUrl = 'v1599011032/cca_pquuqe.png';
        break;

      case cat.includes('ccq'):
        imageUrl = 'v1599011032/ccq_jlsj2q.png';
        break;

      case cat.includes('ccm'):
        imageUrl = 'v1599011032/ccm_dwnfbd.png';
        break;

      case cat.includes('ccb'):
        imageUrl = 'v1599011032/ccb_bszjvm.png';
        break;

      case cat.includes('ccn'):
        imageUrl = 'v1600372515/CCN_logo_color_square_D_caeobs.jpg';
        break;

      case cat.includes('lodestar'):
        imageUrl = 'v1600269487/loadstar_icon1_g3xmy3.jpg';
        break;

      default: // do nothing

    }
  }

  return "https://res.cloudinary.com/dja17zg5p/image/upload/".concat(imageUrl);
}