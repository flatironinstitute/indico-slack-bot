# Indico-Slack-Bot
Bot that sends daily updates of Indico events to Slack.

<!-- TODO: Add Travis & status -->

Indico Slack Bot (ISB) is a [Bolt][bolt] bot that connects [Indico][indico] events to [Slack][slack]. ISB has two primary features:

1. Automated messages that promote the day's events in the designated slack channel (#fi-slack).
2. A slash command `/indico [DATE]` that returns events for the date specified.

[bolt]: https://github.com/SlackAPI/bolt-js
[indico]: https://getindico.io/
[slack]: https://slack.com/

## Installation

<!-- TODO: ADD ADD TO SLACK BUTTON HERE -->

## Resources

### Local Development

To start the ISB Bot run:

`npm run start`

### Additional Documentation

- [Indico][indico-docs]
- [Bolt][bolt-docs]
- [Slack API][slack-api]

[bolt-docs]: https://slack.dev/bolt-js/concepts
[indico-docs]: https://indico.io/docs/
[slack-api]: https://api.slack.com/

## Contributing

Contributions welcome!

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache Version 2.0

See [LICENSE](LICENSE).