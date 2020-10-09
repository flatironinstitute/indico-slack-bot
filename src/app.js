// eslint-disable no-unused-vars
import dayjs from 'dayjs';
import { catchErrors, parseIncomingDate, logError } from './utils';
import { buildSlashResponse, getDailyAutoMessage } from './fabricator';

const { App, ExpressReceiver } = require('@slack/bolt');
const { CronJob } = require('cron');
const path = require('path');

require('dotenv').config();

// Create a Bolt Receiver
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

// Initialize app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});

// Secret testing page
receiver.router.post('/secret', (req, res) => {
  // You're working with an express req and res now.
  res.send('boo! 👻');
});

// Secret testing page
receiver.router.post('/secret', (req, res) => {
  // You're working with an express req and res now.
  res.send('boo! 👻');
});

// landing page
receiver.router.post('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/index.html`));
});

const errBlocks = {
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          "I'm sorry, but I'm unable to connect to Indico. Please <mailto:scicomp@flatironinstitute.org|contact the admin> or try again shortly."
      }
    }
  ]
};

app.message('hello', async ({ message, say }) => {
  await say(
    `Hello <@${message.user}>! I'm the Indico bot. :indico: I post daily updates to the \`#fi-events\` channel about what's going on at Flatiron. \n You can also ask me about future events by typing  \`/indico\`  followed by a date. `
  ).catch((e) => logError(e));
});

// The slash command provides event info for a specific date.
app.command('/indico', async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack();
  const day = parseIncomingDate(command.text);
  let [content, contentErr] = await catchErrors(buildSlashResponse(day));
  if (contentErr) {
    content = errBlocks;
    contentErr += command.text;
    logError(contentErr);
  }

  const param = {
    response_type: 'ephemeral',
    blocks: content.blocks,
    text: `Flatiron event update for ${dayjs(day).format('MMMM DD, YYYY')}`
  };
  // Post response visible only to requesting user
  await respond(param).catch((e) => logError(e));
});

/*
 * Cronjob runs every weekday (Monday through Friday)
 * at 08:01:00 AM. It does not run on Saturday
 * or Sunday.
 *'00 01 08 * * 1-5'
 */
const job = new CronJob(
  '0 */2 * * * *',
  async () => {
    // eslint-disable-next-line no-console
    console.log('You will see this message every 2 minutes');
    const today = dayjs().format('MMMM DD, YYYY');
    let [content, contentErr] = await catchErrors(getDailyAutoMessage());
    if (contentErr) {
      content = errBlocks;
      contentErr += `CronJob @ ${Date.now()}`;
      logError(contentErr);
    }

    app.client.chat.postMessage({
      channel: process.env.SLACK_CHANNEL,
      token: process.env.SLACK_BOT_TOKEN,
      blocks: content.blocks,
      text: `Flatiron event update for ${today}`
    });
  },
  null,
  true,
  'America/New_York'
);
job.start();

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);
  /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
  console.warn('🤖  Indico Bot is running!');
})();
