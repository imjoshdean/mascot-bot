import Behavior from '../behavior.js';
import messages from './messages.json';

class Introductions extends Behavior {
  constructor(settings = {}) {
    settings.name = 'Introductions';

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);
    let promise = Promise.resolve();

    Promise.all([bot.getUser('imjoshdean'), bot.getUser('sheva')]).then((users) => {
      const [josh, sheva] = users,
        joshTag = `<@${josh.id}|${josh.name}>`,
        shevaTag = `<@${sheva.id}|${sheva.name}>`;

      messages.messages.forEach((message) => {
        promise = promise.then(() => {
          const text = message.text.replace('@imjoshdean', joshTag).replace('@sheva', shevaTag);
          return bot.say('#all-staff', text, message.options);
        });
      });
    });

    return promise;
  }
}

export default Introductions;
