import {
  parseIncomingDate
} from './utils';

const {
  App
} = require('@slack/bolt');
require('dotenv').config();

// Initialize app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.message('hello', async ({
  message,
  say
}) => {
  await say(`Hey there <@${message.user}>!`);
});

// The echo command simply echoes on command
app.command('/indico', async ({
  command,
  ack,
  client
}) => {
  // Acknowledge command request
  await ack();
  const day = parseIncomingDate(command.text);
  /* eslint-disable no-console */
  console.log('🎖️', day, command, client);
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);
  /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
  console.warn('🤖  Indico Bot is running!');
})();