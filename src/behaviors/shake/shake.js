import Behavior from '../behavior.js';

class ShakeText extends Behavior {

  constructor(settings) {
    settings.name = 'shake';
    settings.description = `'cause sometimes Capslock doesn't do it!`;
    super(settings);

    this.commands.push({
      tag: 'shake',
      description: `I'll shake your text, cause sometimes Capslock doesn't do it!`
    });
  }

  execute(command, message, channel, data) {
    const parsedMessage = this.parseMessage(message);

    this.bot.postMessage(channel, `${parsedMessage.join('')}`, {
      icon_emoji: ':shakehoof_beatz:',
      thread_ts: data.thread_ts
    });
  }

  parseMessage(message) {
   let splitMessage = message.replace(/^!shake/gi, '')
   		.replace(/\:\w*\:/gi, '')
		.replace(/[^a-zA-Z ]/g, '')
		.trim()
		.split('');

const parsedMessage = splitMessage.map(alpha => alpha == " " ? ":ws:" : `:sh-${alpha}:`);

    return parsedMessage;
  }
}

export default ShakeText;
