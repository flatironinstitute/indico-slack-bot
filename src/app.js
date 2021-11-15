// eslint-disable no-unused-vars
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { catchErrors, parseIncomingDate, logError } from './utils';
import {
  buildSlashResponse,
  getDailyAutoMessage,
  getHolidayMessage,
  getWeeklySCCMessage
} from './fabricator';

dayjs.extend(isBetween);

const { App, ExpressReceiver } = require('@slack/bolt');
const { CronJob } = require('cron');
const path = require('path');

require('dotenv').config();

// Create a Bolt Receiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Initialize app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});

// landing page
receiver.router.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/index.html`));
});

const errBlocks = {
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "I'm sorry, but I'm unable to connect to Indico. Please <mailto:scicomp@flatironinstitute.org|contact the admin> or try again shortly."
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
const jobEventBot = new CronJob(
  '00 01 08 * * 1-5',
  async () => {
    const today = dayjs().format('MMMM DD, YYYY');
    // If today is between Dec 24 and Jan 1 don't send regular message
    const isHoliday = dayjs().isBetween('2020-12-24', '2021-01-02', null, '[]') || dayjs().isBetween('2020-11-25', '2021-11-28', null, '[]');
    if (isHoliday) {
      if (dayjs().isSame('2020-12-24', 'day')) {
        // If day is Dec 24, return happy holidays message.
        let [content, contentErr] = await catchErrors(getHolidayMessage());
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

        // eslint-disable-next-line no-console
        console.log(`✨ Daily #fi-events message sent for ${today}.`);
      }
    } else {
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

      // eslint-disable-next-line no-console
      console.log(`✨ Daily #fi-events message sent for ${today}.`);
    }
  },
  null,
  true,
  'America/New_York'
);

/*
 * Cronjob runs every Monday in the private
 * SCC channel at 04:01:00 PM to remind team
 * to update group calendar.
 *'00 01 16 * * 1'
 */
const jobSCC = new CronJob(
  '00 20 16 * * 1',
  async () => {
    const today = dayjs().format('MMMM DD, YYYY');
    let [content, contentErr] = await catchErrors(getWeeklySCCMessage());
    if (contentErr) {
      content = errBlocks;
      contentErr += `CronJob @ ${Date.now()}`;
      logError(contentErr);
    }

    app.client.chat.postMessage({
      channel: process.env.SCC_CHANNEL,
      token: process.env.SLACK_BOT_TOKEN,
      blocks: content.blocks,
      text: `SCC weekly reminder for ${today}`
    });

    // eslint-disable-next-line no-console
    console.log(`✨ Weekly #fi_scc reminder sent for ${today}.`);
  },
  null,
  true,
  'America/New_York'
);

jobEventBot.start();
jobSCC.start();

(async () => {
  // Start the app
  const port = process.env.PORT || 3000;
  const version = process.env.npm_package_version || 'v.v.v';
  await app.start(port);
  /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
  console.warn(`🤖 Indico Bot ${version} is running on ${port} with pm2 startup.`);
})();
