import Behavior from './behavior.js';

class GreetOnStart extends Behavior {
  constructor(settings = {}) {
    settings.name = settings.name || 'Greet On Start';


    super(settings);
  }

  initialize(bot) {
    console.log('greet on start initialize');
    super.initialize(bot);

    bot.postTo('drop-the-beatz', 'greet-on-start.js working', {
      icon_emoji: ':desktop_computer: '
    })
  }
}

export default GreetOnStart;
