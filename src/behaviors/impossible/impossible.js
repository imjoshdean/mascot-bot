import Behavior from '../behavior.js';

export default class GreetBehavior extends Behavior {
  constructor(settings = {}) {
    settings.name = 'Impossible';

    super(settings);

    this.addCommand('hello', 'Say hello back whenever someone types !dotheimpossible');
  }

  execute(command, message, channel, data) {
    switch (command) {
    case 'hello':
      this.bot.postMessage(channel, `<@${data.user}>:sh-r::sh-o::sh-w::sh-r::sh-o::sh-w::blank::sh-f::sh-i::sh-g::sh-h::sh-t::blank::sh-t::sh-h::sh-e::blank::sh-p::sh-o::sh-w::sh-e::sh-r:`, {
        icon_emoji: ':rowrowHoof_beatz:'
      });
      break;
    default:
      break;
    }
  }
}
