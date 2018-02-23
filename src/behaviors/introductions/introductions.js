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

    Promise.all([bot.getUser('chibishibe')]).then((users) => {
      const [chibishibe] = users,
        chibishibeTag = `<@${chibishibe.id}|${chibishibe.name}>`;

      messages.messages.forEach((message) => {
        promise = promise.then(() => {
          const text = message.text.replace('@chibishibe', chibishibetag)
          return bot.say('#all-staff', text, message.options);
        });
      });
    });

    return promise;
  }
}

export default Introductions;
