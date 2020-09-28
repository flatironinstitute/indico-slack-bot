"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

var HtmlToPlainText = _interopRequireWildcard(require("./htmltoplaintext"));

var Utils = _interopRequireWildcard(require("./utils"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var textVersion = HtmlToPlainText.convert(description).split('\n');
    var plaintext = textVersion[0].slice(0, 140);
    return plaintext;
  }
  /**
   * Provides image url for center-specific image.
   * @param {object} result Indico results object.
   * @return {string} block Formatted cloudinary url.
   */


  static getCenterImageUrl(result) {
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
  /**
   * Wraps assembles the results block.
   * @param {object} result Indico results object.
   * @return {object} block Formatted Slack block.
   */


  assembleResultBlock(result) {
    var description = this.convertHtmltoPlainText(result.description).trim();

    if (description.length) {
      description += ' \n';
    }

    var timeArr = [result.startDate.time, result.endDate.time].map(t => Utils.formatTime(t));
    var location = result.location.length ? result.location : 'remote';
    var text = "*".concat(result.title, "*\n _").concat(location, ",") + " ".concat(timeArr[0], "-").concat(timeArr[1], "_ \n\n") + " ".concat(description, " <").concat(result.url, " | Learn more> \n");
    var image = this.getCenterImageUrl(result);
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
    var divider = {
      type: 'divider'
    };
    var firstHeader = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "*Today's Events*"
      }
    };
    var nullBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_No events scheduled._\n'
      }
    };
    var blocks = [];
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "Hello, this is the *Indico bot* with an event update for *".concat((0, _moment.default)(this.day).format('dddd, MMMM DD'), "*.\n\n ")
      }
    });

    if (!this.isAuto) {
      firstHeader.text.text = "*".concat((0, _moment.default)(this.day).format('dddd, MMMM Do'), "*");
    }

    blocks.push(firstHeader);
    blocks.push(divider);

    if (this.results[0] && this.results[0].length) {
      this.results[0].forEach(r => {
        var block = this.assembleResultBlock(r);
        blocks.push(block);
      });
    } else {
      blocks.push(nullBlock);
    }

    if (this.isAuto) {
      var secondHeader = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: "*Tomorrow's Events*"
        }
      };

      if ((0, _moment.default)(this.day).day() === 5 || (0, _moment.default)(this.day).day() === 6) {
        secondHeader.text.text = "*Monday's Events*";
      }

      blocks.push(secondHeader);
      blocks.push(divider);

      if (this.results[1] && this.results[1].length) {
        this.results[1].forEach(r => {
          var block = this.assembleResultBlock(r);
          blocks.push(block);
        });
      } else {
        blocks.push(nullBlock);
      }
    }

    var payload = {
      blocks
    };
    return payload;
  }

}

var _default = {
  Payload
};
exports.default = _default;