/* eslint-disable class-methods-use-this */
import dayjs from 'dayjs';
import * as Utils from './utils';

export default class Payload {
  /**
   * Slack payload.
   * @param {string} day Date in ISO format.
   * @param {array} results Array of Indico event data objects.
   * @param {boolean} isAuto Is payload for a slash event or auto alert.
   * @return {object} payload Event payload formatted as a json blocks.
   */
  constructor(day, results, isAuto, isHoliday) {
    this.day = day;
    this.results = results;
    this.isAuto = isAuto;
    this.thePayload = null;
    this.isHoliday = isHoliday;
  }

  /**
   * Confirm if an end time should display by searching for end keyword.
   * @param {array} results Array of strings.
   * @return {boolean} showEnd Boolean.
   */
  showEnd(result) {
    let showEnd = false;
    if (result.keywords.length) {
      const showEndArr = result.keywords.filter((keyword) => keyword.toLowerCase().includes('end'));
      showEnd = !!showEndArr.length;
    }
    return showEnd;
  }

  /**
   * Wraps assembles the results block.
   * @param {object} result Indico results object.
   * @return {object} block Formatted Slack block.
   */
  assembleResultBlock(result) {
    const timeArr = [result.startDate.time, result.endDate.time].map((t) => Utils.formatTime(t));
    const time = this.showEnd(result) ? `\`Ending at ${timeArr[1]}\`` : `\`${timeArr[0]}\``;
    const emoji = Utils.getCenterEmojiString(result);
    const text = `${time}  ${emoji} <${result.url} |*${result.title}*>`;
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text
      }
    };
  }

  /**
   * Returns slack payload in blocks format.
   * @return {object} payload Formatted Slack blocks.
   */
  get assembled() {
    const divider = {
      type: 'divider'
    };
    const nullBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_No events scheduled._'
      }
    };
    const dateBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `  *Today*  |  ${dayjs(this.day).format('MMMM DD, YYYY')}  `
      }
    };
    const finalBlock = {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text:
            ':pushpin: Do you have something to include in #fi-events? Contact <mailto:aschneider@flatironinstitute.org?subject=Add Event to Indico via #fi-events |*Flatiron Admin*>.'
        }
      ]
    };
    const holidayBlock1 = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          '`12/24 - 1/3` :snowflake: <https://simonsfoundation.interactgo.com/Interact/Pages/Content/Document.aspx?id=7443 |*Holiday Office Closure*> :snowflake:'
      }
    };
    const holidayBlock2 = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          'Daily update posts are suspended until January 4th. (Even bots :indico: need a break.) Happy holidays - see you next year! :confetti_ball:'
      }
    };
    const blocks = [];

    // Start slash command responses with date
    if (!this.isAuto) {
      dateBlock.text.text = `\n  *${dayjs(this.day).format('MMMM DD, YYYY')}*  `;
    }
    blocks.push(dateBlock);

    if (this.results[0] && this.results[0].length) {
      this.results[0].sort((a, b) =>
        dayjs(a.startDate.time).isAfter(dayjs(b.startDate.time)) ? 1 : -1
      );
      this.results[0].forEach((r) => {
        const block = this.assembleResultBlock(r);
        blocks.push(block);
      });
      // If this is the first day of holiday, send the holiday away message.
    } else if (this.isHoliday) {
      blocks.push(holidayBlock1, holidayBlock2);
    } else {
      blocks.push(nullBlock);
    }

    // Second section of next biz day events for auto daily messages
    if (this.isAuto) {
      const nextDayText =
        dayjs(this.day).day() === 5 || dayjs(this.day).day() === 6
          ? '  *Monday*  '
          : '  *Tomorrow*  ';
      const nextDayDate = dayjs(Utils.getNextDay(this.day)).format('MMMM DD, YYYY');
      const secondHeader = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\n \n ${nextDayText}| ${nextDayDate}  `
        }
      };
      blocks.push(secondHeader);
      if (this.results[1] && this.results[1].length) {
        this.results[0].sort((a, b) =>
          dayjs(a.startDate.time).isAfter(dayjs(b.startDate.time)) ? 1 : -1
        );
        this.results[1].forEach((r) => {
          const block = this.assembleResultBlock(r);
          blocks.push(block);
        });
      } else {
        blocks.push(nullBlock);
      }
    }

    blocks.push(divider);
    blocks.push(finalBlock);
    const payload = {
      blocks
    };
    return payload;
  }
}
