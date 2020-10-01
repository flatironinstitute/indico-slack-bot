"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

var Utils = _interopRequireWildcard(require("./utils"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable class-methods-use-this */
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
    this.thePayload = null;
  }
  /**
   * Wraps assembles the results block.
   * @param {object} result Indico results object.
   * @return {object} block Formatted Slack block.
   */


  assembleResultBlock(result) {
    var description = Utils.convertHtmltoPlainText(result.description).trim();

    if (description.length) {
      description += ' \n';
    }

    var timeArr = [result.startDate.time, result.endDate.time].map(t => Utils.formatTime(t));
    var location = result.location.length ? result.location : 'remote';
    var text = "*".concat(result.title, "*\n _").concat(location, ",") + " ".concat(timeArr[0], "-").concat(timeArr[1], "_ \n\n") + " ".concat(description, " <").concat(result.url, " | Learn more> \n");
    var image = Utils.getCenterImageUrl(result);
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


  get assembled() {
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

exports.default = Payload;