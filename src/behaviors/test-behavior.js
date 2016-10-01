import Behavior from './behavior.js';

class TestBehavior extends Behavior {
  constructor(settings = {}) {
    settings.name = settings.name || 'Greet On Start';

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);

    bot.getGroup('drop-the-beatz').then(group => {
      bot.setTopic(group.id, 'Change the topic again', false);
    });

    bot.say('@foobar', 'greet-on-start.js working', {
      icon_emoji: ':desktop_computer:'
    });


    bot.say('#drop-the-beatz', 'I\'m learning!', {
      icon_emoji: ':desktop_computer:'
    });
  }
}

export default TestBehavior;
