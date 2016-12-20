import MascotBot from './bots/mascot-bot.js';
import ExplainBehaviors from './behaviors/explain-behaviors/explain-behaviors.js';
import RandomChannel from './behaviors/random-channel/random-channel.js';
import DaysUntil from './behaviors/days-until/days-until.js';
import RollTheDice from './behaviors/roll-the-dice/roll-the-dice.js';
import Birthdays from './behaviors/birthdays/birthdays.js';
import Karma from './behaviors/karma/karma.js';

const name = process.env.NAME || 'Beatz Bot',
  beatzBot = new MascotBot({
    name,
    useDatabase: true,
    databaseSettings: {
      keepAlive: 120
    },
    behaviors: [
      ExplainBehaviors,
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
          maxDays: 398,
          sayInChannel: '#all-staff',
          isPublic: true
        }
      },
      {
        behavior: RandomChannel,
        settings: {
          sayInChannel: '#all-staff'
        }
      },
      Karma
    ]
  });

beatzBot.launch();
