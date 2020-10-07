import * as chrono from 'chrono-node';
import dayjs from 'dayjs';
import * as HtmlToPlainText from './htmltoplaintext';

/**
 * Function to parse a string message for date information.
 * @param {string} message The string from slack command.
 * @return {string} day Date in ISO format or null if not found.
 */
function parseIncomingDate(message) {
  const day = chrono.parseDate(message, new Date(), {
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
  const arr = time.split(':');
  let ftime = '';
  if (arr[0] === 12) {
    arr[2] = 'PM';
  } else if (arr[0] > 12) {
    arr[0] -= 12;
    arr[2] = 'PM';
  } else {
    arr[2] = 'AM';
  }
  if (arr[1] === '00') {
    ftime = `${arr[0]} ${arr[2]}`;
  } else {
    ftime = `${arr[0]}:${arr[1]} ${arr[2]}`;
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
const catchErrors = (fn) => {
  return fn.then((res) => [res, undefined]).catch((error) => Promise.resolve([undefined, error]));
};

/**
 * Converts HTML descriptions into plain text.
 * @param {string} description HTML as a string.
 * @return {string} plaintext Formatted for slack.
 */
function convertHtmltoPlainText(description) {
  const textVersion = HtmlToPlainText.convert(description).split('\n');
  const plaintext = textVersion[0].slice(0, 140);
  return plaintext;
}

/**
 * Provides image url for center-specific image.
 * @param {object} result Indico results object.
 * @return {string} block Formatted cloudinary url.
 */
function getCenterEmojiString(result) {
  let emojiStr = ':fi-circle:';
  const keywordArr = result.keywords;
  if (keywordArr.length) {
    const cat = keywordArr[0].toLowerCase();
    switch (true) {
      case cat.includes('cca'):
        emojiStr = ':cca-circle:';
        break;
      case cat.includes('ccq'):
        emojiStr = ':ccq-circle:';
        break;
      case cat.includes('ccm'):
        emojiStr = ':ccm-circle:';
        break;
      case cat.includes('ccb'):
        emojiStr = ':ccb-circle:';
        break;
      case cat.includes('ccn'):
        emojiStr = ':ccn-circle:';
        break;
      case cat.includes('star'):
        emojiStr = ':lodestar-circle:';
        break;
      default: // do nothing
    }
  }
  return emojiStr;
}

/**
 * Gets subsequent weekday from a given date.
 * @param {string} day Date in ISO format.
 * @return {string} next Next weekday in YYYY-MM-DD format.
 */
function getNextDay(day) {
  let add = 1;
  if (dayjs(day).day() === 5) {
    add = 3;
  } else if (dayjs(day).day() === 6) {
    add = 2;
  }
  const next = dayjs(day).add(add, 'days').format('YYYY-MM-DD');
  return next;
}

export {
  parseIncomingDate,
  formatTime,
  logError,
  catchErrors,
  convertHtmltoPlainText,
  getCenterEmojiString,
  getNextDay
};