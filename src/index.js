import MascotBot from './bots/mascot-bot.js';
import RandomChannel from './behaviors/random-channel/random-channel.js';
import DaysUntil from './behaviors/days-until/days-until.js';
import RollTheDice from './behaviors/roll-the-dice/roll-the-dice.js';
import Birthdays from './behaviors/birthdays/birthdays.js';

const name = process.env.NAME || 'Beatz Bot',
  beatzBot = new MascotBot({
    name,
    behaviors: [
      {
        behavior: Birthdays,
        settings: {
          sayInChannel: '#all-staff',
          isPublic: true
        }
      },
      RollTheDice,
      {
        behavior: DaysUntil,
        settings: {
          conDate: '8/11/2017',
          sayInChannel: '#all-staff',
          isPublic: true
        }
      },
      {
        behavior: RandomChannel,
        settings: {
          sayInChannel: '#all-staff'
        }
      }
    ]
  });

beatzBot.launch();
