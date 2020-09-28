import * as Api from './api';
import { logError } from './utils';
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
  // eslint-disable-next-line prettier/prettier
  const res = await Api.queryIndicoByDate(day).catch((e) => logError(e));

  const results = parseIndicoResponse(res);
  const payload = new Payload(day, [results], false);
  const message = payload.assemble();
  return message;
}

export default { buildSlashResponse };
