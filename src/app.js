import { catchErrors, parseIncomingDate, logError } from './utils';
import { buildSlashResponse } from './fabricator';

const { App } = require('@slack/bolt');
require('dotenv').config();

// Initialize app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

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
  // eslint-disable-next-line no-unused-vars
  let [content, contentErr] = await catchErrors(buildSlashResponse(day));
  if (contentErr) {
    // eslint-disable-next-line no-unused-vars
    content = {
      text:
        "I'm sorry, but I'm unable to connect to Indico. Please contact the admin or try again shortly."
    };
    contentErr += command.text;
    logError(contentErr);
  }

  const param = {
    response_type: 'ephemeral',
    blocks: content.blocks
  };
  // // Post response visible only to requesting user
  await respond(param).catch((e) => logError(e));
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);
  /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
  console.warn('🤖  Indico Bot is running!');
})();
