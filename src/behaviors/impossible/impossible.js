import Behavior from '../behavior.js';

export default class GreetBehavior extends Behavior {
  constructor(settings = {}) {
    settings.name = 'Impossible';

    super(settings);

    this.addCommand('dotheimpossible', 'JUST WHO THE :sh-h::sh-e::sh-l::sh-l: *DO YOU THINK I AM?!*');
  }

  execute(command, message, channel, data) {
    switch (command) {
    case 'dotheimpossible':
      this.bot.postMessage(channel, `<@${data.user}>:sh-r::sh-o::sh-w::sh-r::sh-o::sh-w::blank::sh-f::sh-i::sh-g::sh-h::sh-t::blank::sh-t::sh-h::sh-e::blank::sh-p::sh-o::sh-w::sh-a::sh-h:`, {
        icon_emoji: ':rowrowHoof_beatz:'
      });
      break;
    default:
      break;
    }
  }
}
