import Behavior from '../behavior.js';
import Karma from './models/karma.js';

const USER_KARMA_REGEX = /<@(\w+)>(?:[\s\:]*)(\+\+|\-\-)(?:\s?(?:#|\/\/)\s?((?:[\s\S])+))?/gi,
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

    this.commands.push({
      tag: 'list',
      description: 'Displays the top or bottom 10 karma users (e.g. `!list top` or `!list bottom`'
    });
  }

  initialize(bot) {
    bot.on('message', this.parseKarmaMessage.bind(this));
  }

  parseKarmaMessage(messageData) {
    if (messageData.text && messageData.text.match(USER_KARMA_REGEX)) {
      const [, userId, type, reason] = USER_KARMA_REGEX.exec(messageData.text),
        channel = messageData.channel;

      // Trying to give yourself karma? tsk tsk. Not gonna fly.
      if (userId === messageData.user) {
        if (type === '++') {
          this.bot.postMessage(channel, `Aww, that's cute <@${messageData.user}>, thinking you can give yourself karma.`, {
            icon_emoji: ':patpat:'
          });
          return;
        }
      }

      // If you attempt to give karma in a direct message, we stop ya.
      if (channel[0] === 'D') {
        this.bot.postMessage(channel, `Tut tut, <@${messageData.user}>, if you're going to give or take karma, do it in public.`, {
          icon_emoji: ':patpat:'
        });
        return;
      }

      this._getKarmaAndUser(userId).then(data => {
        const user = data.user,
          karma = data.karma,
          shouldIncrement = type === '++',
          method = shouldIncrement ? 'increment' : 'decrement';
        let message = '';

        if (karma[method]) {
          karma[method](1, reason);
          karma.save();
        }

        // If you wanna take karma away from yourself, who am I to stop you?
        if (userId === messageData.user) {
          message = `¯\\_(ツ)_/¯ it's your funeral, <@${user.id}|${user.name}>. `;
        }
        message += `<@${user.id}|${user.name}>'s karma has changed to ${karma.karma}.`;

        this.bot.postMessage(channel, message, {
          icon_emoji: shouldIncrement ? ':karma:' : ':discentia:'
        });
      });
    }
  }

  execute(command, message, channel) {
    switch (command) {
    case 'explain':
      this.giveKarma(message, channel);
      break;
    case 'list':
      this.listKarma(message, channel);
      break;
    default:
      break;
    }
  }

  listKarma(message, channel) {
    if (message.startsWith('!list top')) {
      Karma.list('desc').then(karmaList => {
        let karmaMessage = `The people with the most karma:\n\n`;

        karmaList.forEach(karma => {
          karmaMessage += `${karma.karma} <@${karma.entityName}>\n`;
        });

        this.bot.postMessage(channel, karmaMessage, {
          icon_emoji: ':karma:'
        });
      });
    }
    else if (message.startsWith('!list bottom')) {
      Karma.list('asc').then(karmaList => {
        let karmaMessage = `The people with the least karma:\n\n`;

        karmaList.forEach(karma => {
          karmaMessage += `${karma.karma} <@${karma.entityName}>\n`;
        });

        this.bot.postMessage(channel, karmaMessage, {
          icon_emoji: ':discentia:'
        });
      });
    }
  }

  giveKarma(message, channel) {
    const [, userId] = USER_REGEX.exec(message);

    this.bot.users = undefined;
    this._getKarmaAndUser(userId).then(data => {
      const user = data.user,
        karma = data.karma,
        positive = karma.sample(5, 'positive').map(reason => reason.reason).join('; '),
        negative = karma.sample(5, 'negative').map(reason => reason.reason).join('; ');

      let karmaMessage = `<@${user.id}|${user.name}> has ${karma.karma} karma. The highest it's ` +
        `ever been was ${karma.highest} and the lowest it's ever been was ${karma.lowest}.\n\n`;

      if (positive) {
        karmaMessage += `Positive: ${positive}\n`;
      }

      if (negative) {
        karmaMessage += `Negative: ${negative}\n`;
      }

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
