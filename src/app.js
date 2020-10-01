import { catchErrors, parseIncomingDate, logError } from './utils';
import { buildSlashResponse } from './fabricator';

const { App } = require('@slack/bolt');
require('dotenv').config();

const sampleBlocksChron = {
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: ':sparkles:  Flatiron Events  :sparkles:'
      }
    },
    {
      type: 'context',
      elements: [
        {
          text: '*November 12, 2019*  |  Indico Bot',
          type: 'mrkdwn'
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':calendar: |   *TODAY*  | :calendar: '
      }
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':calendar: |   *TOMORROW*  | :calendar: '
      }
    },
    {
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
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text:
            ":pushpin: Do you have something to include in #fi-events? Here's <http://www.foo.com|*how to submit content*>."
        }
      ]
    }
  ]
};

const sampleBlocksSlash = {
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: ':sparkles:  Flatiron Events  :sparkles:'
      }
    },
    {
      type: 'context',
      elements: [
        {
          text: '*November 12, 2019*  |  Indico Bot',
          type: 'mrkdwn'
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':calendar: |   *Friday, October 2nd *  | :calendar: '
      }
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text:
            ":pushpin: Do you have something to include in #fi-events? Here's *how to submit content*."
        }
      ]
    }
  ]
};

// Initialize app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.message('hello', async ({ message, say }) => {
  await say(`Hola <@${message.user}>! Here comes a sample text.`);
  await say(sampleBlocksSlash);
});

// The echo command simply echoes on command
app.command('/indico', async ({ command, ack, say }) => {
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
  await say(sampleBlocksChron).catch((e) => logError(e));
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);
  /* eslint no-console: ["error", { allow: ["warn", "error"] }] */
  console.warn('🤖  Indico Bot is running!');
})();
