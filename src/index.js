import MascotBot from './bots/mascot-bot.js';
import ExplainBehaviors from './behaviors/explain-behaviors/explain-behaviors.js';
import RandomChannel from './behaviors/random-channel/random-channel.js';
import DaysUntil from './behaviors/days-until/days-until.js';
import RollTheDice from './behaviors/roll-the-dice/roll-the-dice.js';
import Birthdays from './behaviors/birthdays/birthdays.js';
import Karma from './behaviors/karma/karma.js';
import Eventbrite from './behaviors/eventbrite/eventbrite.js';
import Clap from './behaviors/clap/clap.js';
import Greet from './behaviors/greet/greet.js';
import settings from './settings.json';


const mascot = new MascotBot({
  ...settings.bot,
  behaviors: [
    Greet,
    Clap,
    ExplainBehaviors,
    {
      behavior: Birthdays,
      settings: settings.birthdays
    },
    RollTheDice,
    {
      behavior: DaysUntil,
      settings: {
        conDate: '7/28/2018',
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
    Karma,
    {
      behavior: Eventbrite,
      settings: settings.eventbrite
    }
  ]
});

mascot.launch();
