import Behavior from '../behavior.js';

export default class GreetBehavior extends Behavior {
  constructor(settings = {}) {
    settings.name = 'Greet Behavior';

    super(settings);

    this.addCommand('hello', 'Say hello back whenever someone types !hello');
  }

  execute(command, message, channel, data) {
    switch (command) {
    case 'hello':
      this.bot.postMessage(channel, `Hello to you too, <@${data.user}>!`, {
        icon_emoji: ':wave:'
      });
      break;
    default:
      break;
    }
  }
}
