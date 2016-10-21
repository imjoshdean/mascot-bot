import MascotBot from './bots/mascot-bot.js';
import RandomChannel from './behaviors/random-channel/random-channel.js';
import DaysUntil from './behaviors/days-until/days-until.js';
import Introductions from './behaviors/introductions/introductions.js';

const name = process.env.NAME || 'Beatz Bot',
  beatzBot = new MascotBot({
    name,
    behaviors: [
      Introductions,
      {
        behavior: DaysUntil,
        settings: {
          conDate: '08/11/2017',
          sayInChannel: '#drop-the-beatz',
          isPubic: false
        }
      },
      {
        behavior: RandomChannel,
        settings: {
          sayInChannel: '#drop-the-beatz'
        }
      }
    ]
  });

beatzBot.launch();
