import Behavior from './behavior.js';

class GreetOnStart extends Behavior {
  constructor(settings = {}) {
    settings.name = settings.name || 'Greet On Start';

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);

    bot.say('@imjoshdean', 'greet-on-start.js working', {
      icon_emoji: ':desktop_computer:'
    });


    bot.say('#drop-the-beatz', 'greet-on-start.js working', {
      icon_emoji: ':desktop_computer:'
    });


    bot.say('sheva', 'greet-on-start.js working', {
      icon_emoji: ':desktop_computer:'
    });
  }
}

export default GreetOnStart;
