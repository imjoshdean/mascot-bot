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
      this.bot.postMessage(channel, `Yo, What's goin on! Enjoyin' Slack? <@${data.user}>!`, {
        icon_emoji: ':Hoof_beatz:'
      });
      break;
    default:
      break;
    }
  }
}
