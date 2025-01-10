// eslint-disable no-unused-vars
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { catchErrors, parseIncomingDate, logError, isDST } from './utils';
import {
  buildSlashResponse,
  buildGreetingResponse,
  getDailyAutoMessage,
  getHolidayMessage,
  getWeeklySCCMessage
} from './fabricator';

dayjs.extend(isBetween);

const { App, ExpressReceiver } = require('@slack/bolt');
const { CronJob } = require('cron');
const path = require('path');

require('dotenv').config();

/**
 * Create a Bolt reciever
 */
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

/**
 * Initialize app
 */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});

/**
 * Create a landing page
 */
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

/**
 * Responds to hello typed in any channel it is added to.
 */
app.message('hello indico', async ({ message, say }) => {
  const [reply, replyErr] = buildGreetingResponse(message);
  if (replyErr) {
    logError(replyErr);
  }
  await catchErrors(say(reply)).catch((e) => logError(e));
});

/**
 * Slash command to provide event info for a specific date.
 */
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

/**
 * Send daily event message to designated channel.
 */
async function sendDailyMessage() {
  const today = dayjs().format('MMMM DD, YYYY');
  // If today is during holidays don't send regular message
  const isHoliday = true;

  if (isHoliday) {
    if (dayjs().isSame('2021-12-24', 'day')) {
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
    } else {
      // eslint-disable-next-line no-console
      console.log(`❄️ Holiday Break: #fi-events message canceled for ${today}.`);
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
}

/**
 * Send weekly SCC reminder message to update spreadsheet.
 */
async function sendSCCMessage() {
  const today = dayjs().format('MMMM DD, YYYY');

  const isHoliday = dayjs().isBetween('2021-12-24', '2022-01-10', null, '[]');

  if (isHoliday) {
    // eslint-disable-next-line no-console
    console.log(`❄️ Holiday Break: Weekly SCC message canceled for ${today}.`);
  } else {
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
  }
}

/*
 * Cronjob runs every weekday (Monday through Friday)
 * at 08:01:00 AM. It does not run on Saturday
 * or Sunday.
 *'00 01 08 * * 1-5'
 */
const jobEventBot = new CronJob(
  '00 01 08 * * 1-5',
  async () => {
    // eslint-disable-next-line no-console
    console.log(`🤖 jobEventBot triggered.`);
    if (isDST) {
      sendDailyMessage();
    } else {
      // eslint-disable-next-line no-console
      console.log('⏰ Delayed for one hour due to DST.');
      setTimeout(() => {
        sendDailyMessage();
      }, 3600000);
    }
  },
  null,
  true,
  'America/New_York'
);

/*
 * Cronjob runs every at a given time 
 * (or Monday 02:00:00 PM if not given) in 
 * the private SCC channel to remind team 
 * to update group calendar.
 *'00 00 14 * * 1'
 */
const jobSCC = new CronJob(
  process.env.SCC_CRONJOB_SPEC || '00 00 14 * * 1',
  async () => {
    // eslint-disable-next-line no-console
    console.log(`🤖 jobSCC triggered.}`);
    if (isDST) {
      sendSCCMessage();
    } else {
      // eslint-disable-next-line no-console
      console.log('⏰ Delayed for one hour due to DST.');
      setTimeout(() => {
        sendSCCMessage();
      }, 3600000);
    }
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
  console.warn(`🤖 Indico Bot ${version} is running on ${port}.`);
})();
