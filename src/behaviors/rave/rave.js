import Behavior from '../behavior.js';

class TheClap extends Behavior {
  constructor(settings) {
    settings.name = 'Rave';
    settings.description = `'Because Dex needs The Clap as well`;
    super(settings);

    this.commands.push({
      tag: 'rave',
      description: `I'll RAVE your message`
    });
  }

  execute(command, message, channel, data) {
    const parsedMessage = this.parseMessage(message);

    this.bot.postMessage(channel, `${parsedMessage.join(' :rubyrave: ')} :rubyrave:`, {
      icon_emoji: ':rubyrave:',
      thread_ts: data.thread_ts
    });
  }

  parseMessage(message) {
    let splitMessage = message.replace(/^!rave/gi, '').replace(/\s+/g, ' ').trim().split(' ');

    const emojiRegex = /^:.*:$/;

    if (splitMessage.length === 1 && !emojiRegex.test(splitMessage)) {
      splitMessage = splitMessage[0].split('');
    }

    return splitMessage;
  }
}

export default Rave;
