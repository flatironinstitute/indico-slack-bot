const {
  App,
} = require('@slack/bolt');
require('dotenv').config();

// Initialize app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.message('hello', async ({
  message,
  say,
}) => {
  await say(`Hey there <@${message.user}>!`);
});

// The echo command simply echoes on command
app.command('/indico', async ({
  command,
  ack,
  say,
}) => {
  // Acknowledge command request
  await ack();
  const reverse = command.text.split('').reverse().join('');
  await say(`${reverse}`);
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('🤖  Indico Bot is running!');
})();
