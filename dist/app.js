"use strict";

var _utils = require("./utils");

var _fabricator = require("./fabricator");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var {
  App
} = require('@slack/bolt');

require('dotenv').config();

var sampleBlocksChron = {
  blocks: [{
    type: 'header',
    text: {
      type: 'plain_text',
      text: ':sparkles:  Flatiron Events  :sparkles:'
    }
  }, {
    type: 'context',
    elements: [{
      text: '*November 12, 2019*  |  Indico Bot',
      type: 'mrkdwn'
    }]
  }, {
    type: 'divider'
  }, {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: ':calendar: |   *TODAY*  | :calendar: '
    }
  }, {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '`10 AM`  :ccb-circle: *Biophysical Modeling Group Meeting* at _Flatiron Institute_ '
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Learn More',
        emoji: true
      }
    }
  }, {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '`1:15 PM` :ccb-circle: *CCB Brown Bag Seminar: Naomi Globus (CCA/NYU)* at _Zoom_ '
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Learn More',
        emoji: true
      }
    }
  }, {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '`2 PM` :fi: *Sciware/Software Carpentries: Git* at _remote_'
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Learn More',
        emoji: true
      }
    }
  }, {
    type: 'divider'
  }, {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: ':calendar: |   *TOMORROW*  | :calendar: '
    }
  }, {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '`10 AM` :lodestar: *Interviewing Skills for Postdocs* at _remote_'
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'RSVP',
        emoji: true
      }
    }
  }, {
    type: 'divider'
  }, {
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: ":pushpin: Do you have something to include in #fi-events? Here's <http://www.foo.com|*how to submit content*>."
    }]
  }]
};
var sampleBlocksSlash = {
  blocks: [{
    type: 'header',
    text: {
      type: 'plain_text',
      text: ':sparkles:  Flatiron Events  :sparkles:'
    }
  }, {
    type: 'context',
    elements: [{
      text: '*November 12, 2019*  |  Indico Bot',
      type: 'mrkdwn'
    }]
  }, {
    type: 'divider'
  }, {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: ':calendar: |   *Friday, October 2nd *  | :calendar: '
    }
  }, {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '`10 AM`  :ccb_circle: *Biophysical Modeling Group Meeting* at _Flatiron Institute_ '
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Learn More',
        emoji: true
      }
    }
  }, {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '`1:15 PM` :ccb_circle: *CCB Brown Bag Seminar: Naomi Globus (CCA/NYU)* at _Zoom_ '
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Learn More',
        emoji: true
      }
    }
  }, {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '`2 PM` :fi: *Sciware/Software Carpentries: Git* at _remote_'
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Learn More',
        emoji: true
      }
    }
  }, {
    type: 'divider'
  }, {
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: ":pushpin: Do you have something to include in #fi-events? Here's *how to submit content*."
    }]
  }]
}; // Initialize app

var app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
app.message('hello', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (_ref) {
    var {
      message,
      say
    } = _ref;
    yield say("Hola <@".concat(message.user, ">! Here comes a sample text."));
    yield say(sampleBlocksSlash);
  });

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}()); // The echo command simply echoes on command

app.command('/indico', /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (_ref3) {
    var {
      command,
      ack,
      say
    } = _ref3;
    // Acknowledge command request
    yield ack();
    var day = (0, _utils.parseIncomingDate)(command.text); // eslint-disable-next-line no-unused-vars

    var [content, contentErr] = yield (0, _utils.catchErrors)((0, _fabricator.buildSlashResponse)(day));

    if (contentErr) {
      // eslint-disable-next-line no-unused-vars
      content = {
        text: "I'm sorry, but I'm unable to connect to Indico. Please contact the admin or try again shortly."
      };
      contentErr += command.text;
      (0, _utils.logError)(contentErr);
    }

    yield say(sampleBlocksChron).catch(e => (0, _utils.logError)(e));
  });

  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
}());

_asyncToGenerator(function* () {
  // Start the app
  yield app.start(process.env.PORT || 3000);
  /* eslint no-console: ["error", { allow: ["warn", "error"] }] */

  console.warn('🤖  Indico Bot is running!');
})();