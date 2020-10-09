import {
  parseIncomingDate,
  formatTime,
  logError,
  catchErrors,
  convertHtmltoPlainText,
  getCenterEmojiString,
  getNextDay
} from '../src/utils';

test('parses string dates', () => {
  expect(parseIncomingDate('An appointment on Sep 12, 2025').toString()).toBe("Fri Sep 12 2025 12:00:00 GMT-0400 (Eastern Daylight Time)");
});

test('formats time to AM/PM without seconds', () => {
  expect(formatTime('11:22:33')).toBe('11:22 AM');
});