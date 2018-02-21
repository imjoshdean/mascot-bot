import Behavior from '../behavior.js';
import eventbrite from 'node-eventbrite';

class EventBrite extends Behavior {
  constructor(settings = {}) {
    settings.name = 'Eventbrite';
    settings.description = '';

    super(settings);

    this.commands.push({
      tag: 'badges',
      description: `I'll tell you how badges we've sold this year so far`
    });

    this.commands.push({
      tag: 'badges-breakdown',
      description: `I'll breakdown the number of badges we've sold by type`
    });
  }

  initialize(bot) {
    super.initialize(bot);

    this.client = eventbrite({
      ...this.settings.keys,
      version: 'v3'
    });
  }

  execute(command, message, channel, messageData) {

    this.bot.postMessage(channel, `Sorry guys, no peaking until closing ceremonies!`, {
      icon_emoji: `:hoof_beatz:`,
      thread_ts: messageData.thread_ts
    });
 
    return;

    this.client.get('events', `${this.settings.event_id}/ticket_classes`, [], [], (err, response) => {
      if (!err) {
        const tickets = response.ticket_classes.map(type => {
          if (type.quantity_sold !== 0) {
            return {
              sold: type.quantity_sold,
              total: type.quantity_total,
              name: type.name
            };
          }
        }).filter(type => type !== undefined);

        if (command === 'badges') {
          const sum = tickets.map(type => type.sold).reduce((acc, current) => acc + current, 0);

          this.bot.postMessage(channel, `We have sold a total of ${sum} badges.`, {
            icon_emoji: `:admission_tickets:`,
            thread_ts: messageData.thread_ts
          });
        }
        else if (command === 'badges-breakdown') {
          let message = `We've sold the following types of badges:\n`;

          tickets.forEach(type => {
            message += ` • ${type.name}: ${type.sold}${type.total === type.sold ? ' (Sold Out)' : ''}\n`;
          });

          this.bot.postMessage(channel, message, {
            icon_emoji: `:admission_tickets:`,
            thread_ts: messageData.thread_ts
          });
        }
      }
    });
  }

}

export default EventBrite;
