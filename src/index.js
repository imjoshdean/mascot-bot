import MascotBot from './bots/mascot-bot.js';
import RandomChannel from './behaviors/random-channel/random-channel.js';
import DaysUntil from './behaviors/days-until/days-until.js';

const name = process.env.NAME || 'Beatz Bot',
  beatzBot = new MascotBot({
    name,
    behaviors: [
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
