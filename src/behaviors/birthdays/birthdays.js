import Behavior from '../behavior.js';
import authorize from './google-events';
import google from 'googleapis';

const BIRTHDAY_MESSAGE = ':birthday: Happy birthday';

class Birthdays extends Behavior {
  constructor(settings) {
    settings.name = 'Birthdays';
    settings.description = 'Announces staff birthdays every morning';
    settings.sayInChannel = settings.sayInChannel.replace('#', '');

    super(settings);

    this.commands.push({
      tag: 'birthdays',
      description: `I'll tell you whose birthday it is today`
    });
  }

  initialize(bot) {
    super.initialize(bot);
    this.scheduleJob('0 15 * * *', () => {
      bot.users = undefined;
      this.checkForBirthdays(bot).then(users => {
        this.announceBirthday(bot, users, false, this.settings.sayInChannel).then(() => {
          this.updateTopic(bot, users);
          this.giveKarma(bot, users);
        });
      });
    });
  }

  checkForBirthdays(bot) {
    return this.getBirthdays().then((birthdays) => {
      const today = new Date(),
        todaysBirthdays = birthdays[`${today.getMonth() + 1}/${today.getDate()}`],
        userPromises = [];

      if (!todaysBirthdays) {
        this.updateTopic(bot);
        return;
      }

      todaysBirthdays.forEach((person) => {
        userPromises.push(bot.getUser(person.slackName));
      });

      return Promise.all(userPromises).then((users) => {
        return new Promise(resolve => {
          users.forEach((user, index) => {
            user.birthdayInfo = todaysBirthdays[index];
          });

          resolve(users);
        });
      });
    });
  }

  execute(command, message, channel) {
    if(command === 'birthdays') {
      this.bot.users = undefined;
      this.checkForBirthdays(this.bot).then(users => {
        this.announceBirthday(this.bot, users, true, channel);
      });
    }
  }

  getBirthdays() {
    return new Promise((resolve, reject) => {
      authorize(this.settings.credentials)
        .then((auth) => {
          const sheets = google.sheets('v4');

          sheets.spreadsheets.values.get({
            auth,
            ...this.settings.sheets
          }, (err, response) => {
            if (err) {
              return;
            }

            const birthdays = {};

            response.values.forEach((value) => {
              const person = {
                birthday: value[0],
                year: value[1],
                slackName: value[2].toLowerCase().replace('@', '')
              };

              if (birthdays[person.birthday]) {
                birthdays[person.birthday].push(person);
              }
              else {
                birthdays[person.birthday] = [person];
              }
            });
            resolve(birthdays);
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  announceBirthday(bot, users, announceNoBirthdays = false, channel) {
    let message = `Happy birthday to:`;

    if (!users && announceNoBirthdays) {
       return bot.postMessage(channel, `There are no birthdays today, check again tomorrow.`, {
        icon_emoji: ':cake:'
      });
    }
    else if (!users) {
      return Promise.reject('No birthdays today');
    }

    users.forEach((user, index) => {
      message += ` <@${user.id}|${user.name}>`;

      if (user.birthdayInfo.year !== '') {
        const age = new Date().getFullYear() - user.birthdayInfo.year;
        message += ` who is ${age} years old`;
      }
      if (index === users.length - 1) {
        message += '!';
      }
      else {
        message += ',';
      }
    });

    return bot.postMessage(channel, message, {
      icon_emoji: ':cake:'
    });
  }

  giveKarma(bot, users, message = 'birthday karma') {
    users.forEach((user) => {
      bot.postMessage(this.settings.sayInChannel, `<@${user.id}>++ # ${message}`);
    });
  }

  updateTopic(bot, users = []) {
    const getFunction = this.settings.isPublic ? 'getChannel' : 'getGroup',
      topicFunction = this.settings.isPublic ? 'channels.setTopic' : 'groups.setTopic';

    bot[getFunction](this.settings.sayInChannel).then((channel) => {
      // All data is cached with no way to refresh, temporary work around
      bot.groups = undefined;
      bot.channels = undefined;

      // If it's no one's birthday and the channel topic doesn't include our
      // birthday message, we don't need to update the topic.
      if (!users.length && !channel.topic.value.includes(BIRTHDAY_MESSAGE)) {
        return;
      }

      const topic = this.generateBirthdayTopic(channel.topic.value, users);

      bot._api(topicFunction, {
        token: bot.token,
        channel: channel.id,
        topic
      }, (error) => {
        bot.log(topicFunction, true);
        bot.log(error, true);
      });
    }, (error) => {
      bot.log(getFunction, true);
      bot.log(error, true);
    });
  }

  generateBirthdayTopic(topic = '', users = []) {
    const slackUsers = [];
    let birthdayMessage = `${BIRTHDAY_MESSAGE} `,
      topicArray = [];

    // Trim whitespace, only include non-happy birthday messages
    topicArray = topic.split('|').map((item) => {
      if (!item.toLowerCase().includes('happy birthday')) {
        return item.trim();
      }
      return '';
    }).filter(i => i !== '');

    // If we have birthdays, prep the message to put into the topic
    if (users.length) {
      users.forEach((user) => {
        slackUsers.push(`@${user.name}`);
      });

      if (slackUsers.length > 1) {
        birthdayMessage += `${slackUsers.slice(0, -1).join(', ')} and ${slackUsers.slice(-1)}!`;
      }
      else {
        birthdayMessage += `${slackUsers[0]}!`;
      }

      topicArray.splice(1, 0, birthdayMessage);
    }

    return topicArray.join(' | ');
  }
}

export default Birthdays;
