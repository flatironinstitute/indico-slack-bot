import * as chrono from 'chrono-node';

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
  // eslint-disable-next-line prettier/prettier
  return fn
    .then((res) => [res, undefined])
    .catch((error) => Promise.resolve([undefined, error]));
};

export { parseIncomingDate, formatTime, logError, catchErrors };
