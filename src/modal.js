export default class Modal {
  constructor(isAuto) {
    this.isAuto = isAuto;
  }

  /**
   * Returns modal payload in blocks format.
   * @return {object} payload Formatted Slack blocks.
   */
  get assembled() {
    /**
     * Slack modal with info how to submit an indico event.
     */
    const modalPayload = {
      type: 'modal',
      close: {
        type: 'plain_text',
        text: 'Close',
        emoji: true
      },
      title: {
        type: 'plain_text',
        text: 'Add a Listing',
        emoji: true
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text:
              'Daily `#fi-events` posts originate in <https://indico.flatironinstitute.org/| Indico>, the event management system used at Flatiron Institute for conferences, workshops, and meetings. \n \n If you need assistance adding an event to Indico, please contact your Center Administration Manager or <mailto:aschneider@flatironinstitute.org | Abraham Schneider> for Institute-wide events.'
          }
        }
      ]
    };
    const nullBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_No events scheduled._'
      }
    };

    if (!this.isAuto) {
      return modalPayload;
    }
    return nullBlock;
  }
}
