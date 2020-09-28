"use strict";

var _utils = require("./utils");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var {
  App
} = require('@slack/bolt');

require('dotenv').config(); // Initialize app


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
    yield say("Hey there <@".concat(message.user, ">!"));
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
      client
    } = _ref3;
    // Acknowledge command request
    yield ack();
    var day = (0, _utils.parseIncomingDate)(command.text);
    /* eslint-disable no-console */

    console.log('🎖️', day, command, client);
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