# Indico-Slack-Bot

Bot that sends daily updates of Indico events to Slack.

<!-- TODO: Add Travis & status -->

![indico-bot-icon](https://github.com/lizlove/indico-slack-bot/blob/master/public/indico-white-circle.png)

Indico Slack Bot (ISB) is a [Bolt][bolt] bot that connects [Indico][indico] events to [Slack][slack]. ISB has two primary features:

1. Automated messages that promote the day's events in the designated slack channel (#fi-events).
2. A slash command `/indico [DATE]` that returns events for the date specified.

[bolt]: https://github.com/SlackAPI/bolt-js
[indico]: https://getindico.io/
[slack]: https://slack.com/

## Installation

Currently installation is only available via manual authorization on Slack. Should you wish to install this app on your own Indico instance, please contact the developer.

<!-- TODO: ADD ADD TO SLACK BUTTON HERE -->

## Resources

### Local Development

First things first, to run a new local instance of _Indico Slack Bot_, you will need to create a new [Slack app][slack-app] and store the client and bot tokens in a `.env` file. Slack requires a valid public url to be live and answering a ping to the response url `/slack/events` before they will generate the bot user token. Try [ngrok][ngrok] to temporarily expose your local webserver during development.

_ISB_ uses [Babel][babel] to compile backwards compatible JS and [ESLint][eslint] to tidy things up:

`npm run build`

To start _ISB_ locally run:

`npm run start`

### Additional Documentation

- [Indico][indico-docs]
- [Bolt][bolt-docs]
- [Slack API][slack-api]

[bolt-docs]: https://slack.dev/bolt-js/concepts
[indico-docs]: https://indico.io/docs/
[slack-api]: https://api.slack.com/
[slack-app]: https://api.slack.com/apps?new_app=1
[ngrok]: https://ngrok.com/
[eslint]: https://eslint.org/
[babel]: https://babeljs.io/docs/en/

## Contributing

Contributions welcome!

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache Version 2.0

See [LICENSE](LICENSE).
