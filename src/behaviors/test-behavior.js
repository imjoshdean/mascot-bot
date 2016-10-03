import Behavior from './behavior.js';

class TestBehavior extends Behavior {
  constructor(settings = {}) {
    settings.name = settings.name || 'Greet On Start';

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);

    this.scheduleJob('*/5 * * * * *', () => {
      bot.say('#drop-the-beatz', 'I am super chatty!');
    });
  }
}

export default TestBehavior;
