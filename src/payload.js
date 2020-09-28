import moment from 'moment';
import * as HtmlToPlainText from './htmltoplaintext';
import * as Utils from './utils';

class Payload {
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
  }

  /**
   * Converts HTML descriptions into plain text.
   * @param {string} description HTML as a string.
   * @return {string} plaintext Formatted for slack.
   */
  static convertHtmltoPlainText(description) {
    const textVersion = HtmlToPlainText.convert(description).split('\n');
    const plaintext = textVersion[0].slice(0, 140);
    return plaintext;
  }

  /**
   * Provides image url for center-specific image.
   * @param {object} result Indico results object.
   * @return {string} block Formatted cloudinary url.
   */
  static getCenterImageUrl(result) {
    let imageUrl = 'v1599011059/fi_a0ovmj.png';
    const keywordArr = result.keywords;
    if (keywordArr.length) {
      const cat = keywordArr[0].toLowerCase();
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
    return `https://res.cloudinary.com/dja17zg5p/image/upload/${imageUrl}`;
  }

  /**
   * Wraps assembles the results block.
   * @param {object} result Indico results object.
   * @return {object} block Formatted Slack block.
   */
  assembleResultBlock(result) {
    let description = this.convertHtmltoPlainText(result.description).trim();
    if (description.length) {
      description += ' \n';
    }
    const timeArr = [result.startDate.time, result.endDate.time].map((t) => Utils.formatTime(t));
    const location = result.location.length ? result.location : 'remote';
    const text =
      `*${result.title}*\n _${location},` +
      ` ${timeArr[0]}-${timeArr[1]}_ \n\n` +
      ` ${description} <${result.url} | Learn more> \n`;
    const image = this.getCenterImageUrl(result);
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text
      },
      accessory: {
        type: 'image',
        image_url: image,
        alt_text: 'category icon'
      }
    };
  }

  /** Notes: Alternate Payload Styling
   * *Tuesday, September 22:* < url | 160 Speaker Series: Grant Sanderson>
   * Start: 4: 00 PM September 22 2020
   * End: 5: 00 PM September 22 2020
   * Location: Zoom Webinar
   * Contact: ewood @simonsfoundation.org
   */

  assemble() {
    const divider = {
      type: 'divider'
    };
    const firstHeader = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "*Today's Events*"
      }
    };
    const nullBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_No events scheduled._\n'
      }
    };

    const blocks = [];
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hello, this is the *Indico bot* with an event update for *${moment(this.day).format(
          'dddd, MMMM DD'
        )}*.\n\n `
      }
    });

    if (!this.isAuto) {
      firstHeader.text.text = `*${moment(this.day).format('dddd, MMMM Do')}*`;
    }
    blocks.push(firstHeader);
    blocks.push(divider);

    if (this.results[0] && this.results[0].length) {
      this.results[0].forEach((r) => {
        const block = this.assembleResultBlock(r);
        blocks.push(block);
      });
    } else {
      blocks.push(nullBlock);
    }

    if (this.isAuto) {
      const secondHeader = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: "*Tomorrow's Events*"
        }
      };
      if (moment(this.day).day() === 5 || moment(this.day).day() === 6) {
        secondHeader.text.text = "*Monday's Events*";
      }
      blocks.push(secondHeader);
      blocks.push(divider);
      if (this.results[1] && this.results[1].length) {
        this.results[1].forEach((r) => {
          const block = this.assembleResultBlock(r);
          blocks.push(block);
        });
      } else {
        blocks.push(nullBlock);
      }
    }
    const payload = {
      blocks
    };
    return payload;
  }
}

export default {
  Payload
};