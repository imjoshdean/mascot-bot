import Behavior from '../behavior.js';
import Karma from './models/karma.js';

const USER_KARMA_REGEX = /^<@(\w+)>(\+\+|\-\-)(?:\s?#\s?((?:[\s\S])+))?/gi,
  USER_REGEX = /<@(\w+)>/gi;

class KarmaBehavior extends Behavior {
  constructor(settings) {
    settings.name = 'Karma';
    settings.description = 'Karma is fun, `++` or `--` people, places, or things!';
    super(settings);

    this.commands.push({
      tag: 'explain',
      description: 'Displays the karma for the provided users (e.g. `!karma @beatz-bot`)'
    });
  }

  initialize(bot) {
    bot.on('message', messageData => {
      this.bot.users = undefined;
      if (messageData.text && messageData.text.match(USER_KARMA_REGEX)) {
        const [, userId, type, reason] = USER_KARMA_REGEX.exec(messageData.text),
          channel = messageData.channel;

        this._getKarmaAndUser(userId).then(data => {
          const user = data.user,
            karma = data.karma,
            shouldIncrement = type === '++',
            method = shouldIncrement ? 'increment' : 'decrement';

          if (karma[method]) {
            karma[method](1, reason);
            karma.save();
          }
          this.bot.postMessage(channel, `<@${user.id}|${user.name}>'s karma has changed to ${karma.karma}.`, {
            icon_emoji: shouldIncrement ? ':karma:' : ':discentia:'
          });
        });
      }
    });
  }

  execute(command, message, channel) {
    const [, userId] = USER_REGEX.exec(message);

    this.bot.users = undefined;
    this._getKarmaAndUser(userId).then(data => {
      const user = data.user,
        karma = data.karma,
        positive = karma.sample(5, 'positive').map(reason => reason.reason).join('; '),
        negative = karma.sample(5, 'negative').map(reason => reason.reason).join('; ');

      let karmaMessage = `<@${user.id}|${user.name}> has ${karma.karma} karma. The highest it's ` +
        `ever been was ${karma.highest} and it's ever been was ${karma.lowest}.\n\n`;

      karmaMessage += `Positive: ${positive}\n`;
      karmaMessage += `Negative: ${negative}\n`;

      this.bot.postMessage(channel, karmaMessage, {
        icon_emoji: ':karma:'
      });
    });
  }

  _getKarmaAndUser(userId) {
    return new Promise(resolve => {
      this.bot.getUserById(userId).then(user => {
        Karma.findOrCreate({
          entityId: `person|${user.id}`
        }).then(karma => {
          resolve({
            karma,
            user
          });
        });
      });
    });
  }
}

export default KarmaBehavior;