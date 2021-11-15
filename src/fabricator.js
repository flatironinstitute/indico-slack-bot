import dayjs from 'dayjs';
import queryIndicoByDate from './api';
import { logError, getNextDay } from './utils';
import Payload from './payload';

/**
 * Confirm if a result does not contain a test entry.
 * @param {object} result Indico result data object.
 * @return {boolean} isTest Boolean.
 */
function isValid(result) {
  const isTest =
    // eslint-disable-next-line no-prototype-builtins
    result.hasOwnProperty('category') && result.category.toLowerCase().indexOf('test') === -1;
  return isTest;
}

/**
 * Confirm if an event is open by searching for closed keyword.
 * @param {array} result Indico result data object.
 * @return {boolean} openess Boolean.
 */
function isOpen(result) {
  let openness = true;
  if (result.keywords.length) {
    const closedArr = result.keywords.filter((keyword) => keyword.toLowerCase().includes('close'));
    openness = !closedArr.length;
  }
  return openness;
}

/**
 * Determine if today is the first weekday of the month.
 * @return {boolean} isFirstWeekday Boolean.
 */
function isTodayFirstWeekdayOfTheMonth() {
  let isFirstWeekday = false;
  const todayOfMonth = dayjs().date();
  let firstDay = dayjs().startOf('month');
  // If first day of month is a weekday.
  if (firstDay.day() > 0 && firstDay.day() < 6) {
    if (todayOfMonth === 1) {
      isFirstWeekday = true;
    }
  } else {
    // Add days to get the first weekday of the month.
    const add = firstDay.day() > 0 ? 2 : 1;
    firstDay = firstDay.add(add, 'day');
    // If today is the first weekday return true.
    if (todayOfMonth === firstDay.date()) {
      isFirstWeekday = true;
    }
  }
  return isFirstWeekday;
}

/**
 * Confirm if an event is rolling and whether it should be displayed if it is the first weekday of the month.
 * @param {array} result Indico result data object.
 * @return {boolean} Not rolling Boolean.
 */
function isNotRolling(result) {
  let showResult = true;
  let isRolling = false;
  const isFirstWeekday = isTodayFirstWeekdayOfTheMonth();
  if (result.keywords.length) {
    const rollingArr = result.keywords.filter((keyword) =>
      keyword.toLowerCase().includes('rolling')
    );
    isRolling = rollingArr.length;
  }
  if (isRolling && !isFirstWeekday) {
    showResult = false;
  }
  return showResult;
}

/**
 * Remove test events from Indico response object.
 * @param {object} res Indico event data API response.
 * @return {array} events Filtered event array.
 */
function parseIndicoResponse(res) {
  if (res.results) {
    const events = [];
    res.results.forEach((result) => {
      if (isValid(result) && isOpen(result) && isNotRolling(result)) {
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
  const payload = new Payload(day, [results], false, false);
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
  const payload = new Payload(day, results, true, false);
  const message = payload.assembled;
  return message;
}

/**
 * Function to generate seasonal holiday closure message.
 * @return {object} payload The payload text for a slack response.
 */
async function getHolidayMessage() {
  const day = new Date();
  const payload = new Payload(day, [], false, true);
  const message = payload.assembled;
  return message;
}

/**
 * Function to generate weekly reminders to complete SCC update spreadsheet.
 * @return {object} payload The payload text for a slack response.
 */
async function getWeeklySCCMessage() {
  const payload = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ":wave: Hello, this is a reminder to please update the spreadsheet before tomorrow's SCC meeting. Remember that the meeting's new time is *1:30PM*. Thanks!"
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Open :gsheet:',
            emoji: true
          },
          value: 'click_spreadsheet_link',
          url: 'https://docs.google.com/spreadsheets/d/1kYEEHUI9i5G3kjbUP59dFBZkx9zT4bgfmyBnR4LWXuA/edit?usp=sharing',
          action_id: 'button-action'
        }
      }
    ]
  };
  return payload;
}

export {
  buildSlashResponse,
  parseIndicoResponse,
  getDailyAutoMessage,
  getHolidayMessage,
  getWeeklySCCMessage
};
