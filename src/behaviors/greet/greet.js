import Behavior from '../behavior.js';

export default class GreetBehavior extends Behavior {
  constructor(settings = {}) {
    settings.name = 'Greet Behavior';

    super(settings);

    this.addCommand('hello', 'Say !hello and I\'ll say hi back!');
  }

  execute(command, message, channel, data) {
    switch (command) {
    case 'hello':
      this.bot.postMessage(channel, `Yo, What's goin on! Enjoyin' Slack? <@${data.user}>!`, {
        icon_emoji: ':grissgif_fast:'
      });
      break;
    default:
      break;
    }
  }
}
