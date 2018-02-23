import Behavior from '../behavior.js';

class RollTheDice extends Behavior {

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

    this.bot.postMessage(channel, `${parsedMessage.join(' :blank: ')} :blank:`, {
      icon_emoji: ':clap:',
      thread_ts: data.thread_ts
    });
  }

  parseMessage(message) {
    let splitMessage = message.replace(/^!shake/gi, '').replace(/\s+/g, ' ').trim().split(' ');

    const emojiRegex = /^:.*:$/;

    if (splitMessage.length === 1 && !emojiRegex.test(splitMessage)) {
      splitMessage = splitMessage[0].split('');
    }

    return splitMessage;
  }
}

export default RollTheDice;
