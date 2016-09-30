import MascotBot from './bots/mascot-bot.js';
import GreetOnStart from './behaviors/greet-on-start.js';

const name = process.env.NAME || 'Beatz Bot',
  beatzBot = new MascotBot({
    name,
    behaviors: [
      GreetOnStart
    ]
  });

beatzBot.launch();
