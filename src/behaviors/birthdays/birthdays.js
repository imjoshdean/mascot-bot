import Behavior from '../behavior.js';
import authorize from './google-events';
import google from 'googleapis';
import credentials from './client.json';

class Birthdays extends Behavior {
  constructor(settings) {
    settings.name = 'Birthdays';
    settings.sayInChannel = settings.sayInChannel.replace('#', '');

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);
    this.scheduleJob('0 15 * * *', () => {
      this.checkForBirthdays(bot);
    });
  }

  checkForBirthdays(bot) {
    this.getBirthdays().then((birthdays) => {
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

      Promise.all(userPromises).then((users) => {
        users.forEach((user, index) => {
          user.birthdayInfo = todaysBirthdays[index];
        });

        this.announceBirthday(bot, users).then(() => {
          this.updateTopic(bot, users);
          // Karma coming soon via a different behavior.
          // this.giveKarma(bot, users);
        });
      });
    });
  }

  getBirthdays() {
    return new Promise((resolve) => {
      authorize(credentials).then((auth) => {
        const sheets = google.sheets('v4');

        sheets.spreadsheets.values.get({
          auth,
          spreadsheetId: '1gNkOqGubDyI2oBCU9MzduS5sd_GK_MfS53sLRhZO_ns',
          range: 'Form Responses 1!C2:E'
        }, (err, response) => {
          if (err) {
            return;
          }

          const birthdays = {};

          response.values.forEach((value) => {
            const person = {
              birthday: value[0],
              year: value[1],
              slackName: value[2]
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
      });
    });
  }

  announceBirthday(bot, users) {
    let message = `Happy birthday to:`;

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

    return bot.say('#beatz-aux-port', message, {
      icon_emoji: ':cake:'
    });
  }

  giveKarma(bot, users, message = 'birthday karma') {
    users.forEach((user) => {
      bot.say(this.settings.sayInChannel, `<@${user.id}|${user.name}>++ # ${message}`);
    });
  }

  updateTopic(bot, users = []) {
    const getFunction = this.settings.isPublic ? 'getChannel' : 'getGroup',
      topicFunction = this.settings.isPublic ? 'channels.setTopic' : 'groups.setTopic';

    bot[getFunction](this.settings.sayInChannel).then((channel) => {
      // All data is cached with no way to refresh, temporary work around
      bot.groups = undefined;
      bot.channels = undefined;
      const slackUsers = [];
      let topic = channel.topic.value.split('|'),
        message = ':birthday: Happy birthday ';

      // Trim whitespace, only include non-happy birthday messages
      topic = topic.map((item) => {
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
          message += slackUsers.slice(0, -1).join(', ') + ' and ' + slackUsers.slice(-1);
        }
        else {
          message += slackUsers[0];
        }

        message += '!';

        topic.splice(1, 0, message);
      }

      topic = topic.join(' | ');

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
}

export default Birthdays;