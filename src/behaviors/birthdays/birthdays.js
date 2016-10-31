import Behavior from '../behavior.js';
import authorize from './google-events';
import google from 'googleapis';
import credentials from './client.json';

class Birthdays extends Behavior {
  constructor(settings) {
    settings.name = 'Birthdays';

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);
    this.scheduleJob('0 16 * * *', () => {
      this.checkForBirthdays(bot);
    });
  }

  checkForBirthdays(bot) {
    this.getBirthdays().then((birthdays) => {
      const today = new Date(),
        todaysBirthdays = birthdays[`${today.getMonth() + 1}/${today.getDate()}`],
        userPromises = [];

      if (!todaysBirthdays.length) {
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
          this.giveKarma(bot, users);
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
    let message = `Happy birthday to`;

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

    return bot.say('#drop-the-beatz', message, {
      icon_emoji: ':cake:'
    });
  }

  giveKarma(bot, users, message = 'birthday karma') {
    users.forEach((user) => {
      bot.say('#drop-the-beatz', `<@${user.id}|${user.name}>++ # ${message}`);
    });
  }
}

export default Birthdays;

// authorize(credentials).then((auth) => {
//   const sheets = google.sheets('v4');

//   sheets.spreadsheets.values.get({
//     auth,
//     spreadsheetId: '1gNkOqGubDyI2oBCU9MzduS5sd_GK_MfS53sLRhZO_ns',
//     range: 'Form Responses 1!C1:E'
//   }, (err, response) => {
//     if (err) {
//       console.log('There was a problem getting the spreadsheet', err);

//       return;
//     }

//     const keys = response.values.shift();

//     console.log(_.map(response.values, (value) => {
//       const obj = {};

//       obj[keys[0]] = value[0];
//       obj[keys[1]] = value[1];
//       obj[keys[2]] = value[2];
//       return obj;
//     }));
//   });

// });
