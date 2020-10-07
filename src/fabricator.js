import queryIndicoByDate from './api';
import { logError, getNextDay } from './utils';
import Payload from './payload';

/**
 * Remove test events from Indico response object.
 * @param {object} res Indico event data API response.
 * @return {array} events Filtered event array.
 */
function parseIndicoResponse(res) {
  if (res.results) {
    const events = [];
    res.results.forEach((result) => {
      if (
        // eslint-disable-next-line no-prototype-builtins
        result.hasOwnProperty('category') &&
        result.category.toLowerCase().indexOf('test') === -1
      ) {
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
async function buildSlashResponse(day) {
  const res = await queryIndicoByDate(day).catch((e) => logError(e));
  const results = parseIndicoResponse(res);
  const payload = new Payload(day, [results], false);
  const message = payload.assembled;
  return message;
}

/**
 * Function to gather indico info and organize daily auto messages.
 * @return {object} payload The payload text for a slack response.
 */
async function getDailyAutoMessage() {
  const day = new Date();
  const next = getNextDay(day);

  const results = await Promise.all(
    [day, next].map(async (d) => {
      let res;
      try {
        res = await queryIndicoByDate(d);
      } catch (e) {
        logError(e);
      }
      return parseIndicoResponse(res);
    })
  ).catch((e) => logError(e));
  const payload = new Payload(day, results, true);
  const message = payload.assembled;
  return message;
}

export { buildSlashResponse, parseIndicoResponse, getDailyAutoMessage };
