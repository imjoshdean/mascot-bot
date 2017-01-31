import Behavior from '../behavior.js';
import Karma from './models/karma.js';

const USER_KARMA_REGEX = /<@(\w+)(?:\|\w+)?>(?:[\s\:]*)(\+\+|\-\-)(?:\s?(?:#|\/\/)\s?((?:[\s\S])+))?/gi,
  USER_REGEX = /<@(\w+)>/gi,
  THING_KARMA_REGEX = /((?:\w+)|["|“|”](?:[\s\S]+)["|“|”])(\+\+|\-\-)(?:\s?(?:#|\/\/)\s?((?:[\s\S])+))?/gi,
  THING_REGEX = /!explain ((?:\w+)|["|“|”](?:[\s\S]+)["|“|”])/gi,
  LIST_REGEX = /^!(?:top|bottom) (thing|person)/gi;

class KarmaBehavior extends Behavior {
  constructor(settings) {
    settings.name = 'Karma';
    settings.description = 'Karma is fun, `++` or `--` people, places, or things!';
    super(settings);

    this.commands.push({
      tag: 'explain',
      description: 'I\'ll tell you about someone\'s karma and some reasons why '
        + 'they have that much. Try `!karma @beatz-bot`'
    });

    this.commands.push({
      tag: 'top',
      description: 'I\'ll list the top 10 karma for people and things. If you want just one or the '
        + 'other, try `!top person` or `!top thing`'
    });

    this.commands.push({
      tag: 'bottom',
      description: 'I\'ll list the bottom 10 karma for people and things. If you want just one or the '
        + 'other, try `!bottom person` or `!bottom thing`'
    });
  }

  initialize(bot) {
    bot.on('message', this.parseKarmaMessage.bind(this));
  }

  parseKarmaMessage(messageData) {
    if (messageData.text && messageData.text.match(USER_KARMA_REGEX)) {
      const [, userId, type, reason] = USER_KARMA_REGEX.exec(messageData.text),
        channel = messageData.channel;

      USER_KARMA_REGEX.lastIndex = 0;

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
    else if (messageData.text && messageData.text.match(THING_KARMA_REGEX)) {
      if (messageData.text.includes('karma has changed to')) {
        return;
      }

      const [, thing, type, reason] = THING_KARMA_REGEX.exec(messageData.text),
        channel = messageData.channel;

      THING_KARMA_REGEX.lastIndex = 0;

      this._getKarmaAndThing(thing).then(data => {
        const thing = data.thing,
          karma = data.karma,
          shouldIncrement = type === '++',
          method = shouldIncrement ? 'increment' : 'decrement';
        let message = '';

        if (karma[method]) {
          karma[method](1, reason);
          karma.save();
        }

        message += `${thing}'s karma has changed to ${karma.karma}.`;

        this.bot.postMessage(channel, message, {
          icon_emoji: shouldIncrement ? ':karma:' : ':discentia:'
        });
      });
    }
  }

  execute(command, message, channel, data) {
    switch (command) {
    case 'explain':
      this.explainKarma(message, channel, data);
      break;
    case 'top':
      this.listKarma(message, channel, true);
      break;
    case 'bottom':
      this.listKarma(message, channel, false);
      break;
    default:
      break;
    }
  }

  listKarma(message, channel, isTop = true) {
    const [, entity] = LIST_REGEX.exec(message) || [];
    let karmaMessage = `The ${entity ? `${entity}s` : 'people and things'} with the ${isTop ? 'most' : 'least'} karma:\n\n`;


    LIST_REGEX.lastIndex = 0;

    Karma.list(isTop ? 'desc' : 'asc', 10, entity).then(karmaList => {
      karmaList.forEach(karma => {
        if (karma.name) {
          karmaMessage += `${karma.karma} ${karma.name}\n`;
        }
        else {
          karmaMessage += `${karma.karma} <@${karma.entityName}>\n`;
        }
      });

      this.bot.postMessage(channel, karmaMessage, {
        icon_emoji: `:${isTop ? 'karma' : 'discentia'}:`
      });
    });
  }

  explainKarma(message, channel, data) {
    let [, userId] = USER_REGEX.exec(message) || [];
    const [, thing] = THING_REGEX.exec(message) || [];

    USER_REGEX.lastIndex = 0;
    THING_REGEX.lastIndex = 0;

    if (message.toLowerCase().trim() === '!explain') {
      userId = data.user;
    }

    if (userId) {
      this.bot.users = undefined;
      this._getKarmaAndUser(userId).then(data => {
        const user = data.user,
          karma = data.karma,
          positive = karma.sample(5, 'positive').map(reason => reason.reason).join('; '),
          negative = karma.sample(5, 'negative').map(reason => reason.reason).join('; ');

        this._postKarma(channel, `<@${user.id}|${user.name}>`, karma, positive, negative);
      });
    }
    else if (thing) {
      this._getKarmaAndThing(thing).then(data => {
        const thing = data.thing,
          karma = data.karma,
          positive = karma.sample(5, 'positive').map(reason => reason.reason).join('; '),
          negative = karma.sample(5, 'negative').map(reason => reason.reason).join('; ');

        this._postKarma(channel, `"${thing}"`, karma, positive, negative);
      });
    }
  }

  _postKarma(channel, thing, karma, positive, negative) {
    let karmaMessage = `${thing} has ${karma.karma} karma. The highest it's ` +
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

  _getKarmaAndThing(thing) {
    // There are too many different kinds of double quotes...
    thing = Karma.stripQuotes(thing);
    const sanitized = Karma.sanitize(thing);

    return new Promise(resolve => {
      Karma.findOrCreate({
        entityId: `thing|${sanitized}`,
        name: thing
      }).then(karma => {
        resolve({
          karma,
          thing
        });
      });
    });
  }
}

export default KarmaBehavior;
