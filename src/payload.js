/* eslint-disable class-methods-use-this */
import moment from 'moment';
import * as Utils from './utils';

export default class Payload {
  /**
   * Slack payload.
   * @param {string} day Date in ISO format.
   * @param {array} results Array of Indico event data objects.
   * @param {boolean} isAuto Is payload for a slash event or auto alert.
   * @return {object} payload Event payload formatted as a json blocks.
   */
  constructor(day, results, isAuto) {
    this.day = day;
    this.results = results;
    this.isAuto = isAuto;
    this.thePayload = null;
  }

  /**
   * Wraps assembles the results block.
   * @param {object} result Indico results object.
   * @return {object} block Formatted Slack block.
   */
  assembleResultBlock(result) {
    const timeArr = [result.startDate.time, result.endDate.time].map((t) => Utils.formatTime(t));
    const time = `\`${timeArr[0]}\``;
    const emoji = Utils.getCenterEmojiString(result);
    const text = `${time} ${emoji} <${result.url} |*${result.title}*>`;
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text
      }
    };
  }

  get assembled() {
    const divider = {
      type: 'divider'
    };
    const firstHeader = {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `  ${moment(this.day).format('dddd, MMMM Do')}  `
      }
    };

    const contextHeader = {
      type: 'context',
      elements: [
        {
          text: `**${moment(this.day).format('MMMM DD, YYYY')}**  |  Indico Bot`,
          type: 'mrkdwn'
        }
      ]
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
        text: ' |   *TODAY*  |  '
      }
    };

    const finalBlock = {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text:
            ":pushpin: Do you have something to include in #fi-events? Here's <http://www.foo.com|*how to submit content*>."
        }
      ]
    };

    const blocks = [];
    if (this.isAuto) {
      firstHeader.text.text = '  Flatiron Events  ';
    }
    blocks.push(firstHeader);

    if (this.isAuto) {
      blocks.push(contextHeader);
    }

    blocks.push(divider);

    if (this.isAuto) {
      blocks.push(dateBlock);
    }

    if (this.results[0] && this.results[0].length) {
      this.results[0].forEach((r) => {
        const block = this.assembleResultBlock(r);
        blocks.push(block);
      });
    } else {
      blocks.push(nullBlock);
    }

    blocks.push(divider);

    if (this.isAuto) {
      const secondHeader = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ' |   *TOMORROW*  |  '
        }
      };
      if (moment(this.day).day() === 5 || moment(this.day).day() === 6) {
        secondHeader.text.text = ' |   *MONDAY*  |  ';
      }
      blocks.push(secondHeader);
      if (this.results[1] && this.results[1].length) {
        this.results[1].forEach((r) => {
          const block = this.assembleResultBlock(r);
          blocks.push(block);
        });
      } else {
        blocks.push(nullBlock);
      }
      blocks.push(divider);
    }
    blocks.push(finalBlock);
    const payload = {
      blocks
    };
    return payload;
  }
}
