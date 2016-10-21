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
          conDate: '10/19/2016',
          sayInChannel: '#drop-the-beatz',
          isPubic: false
        }
      }/*,
      {
        behavior: RandomChannel,
        settings: {
          sayInChannel: '#drop-the-beatz'
        }
      }*/
    ]
  });

beatzBot.launch();
