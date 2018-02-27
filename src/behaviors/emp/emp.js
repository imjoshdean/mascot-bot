import Behavior from '../behavior.js';

class Emp extends Behavior {
  constructor(settings) {
    settings.name = 'Emphasis Emoji';
    settings.description = `'cause sometimes you need emphasis!`;
    super(settings);

    ['clap', 'rubyrave', 'wut'].forEach(emoji => this.commands.push({
      tag: emoji,
      description: `I'll hype your message!`
    }));
  }

  execute(command, message, channel, data) {
    const parsedMessage = this.parseMessage(message, command);

    this.bot.postMessage(channel, `${parsedMessage.join(' :' + command + ': ')} :${command}:`, {
      icon_emoji: `:${command}:`,
      thread_ts: data.thread_ts
    });
  }

  parseMessage(message, command) {
    let splitMessage = message.replace(new RegExp(`^!${command}`, 'gi'), '').replace(/\s+/g, ' ').trim().split(' ');

    const emojiRegex = /^:.*:$/;

    if (splitMessage.length === 1 && !emojiRegex.test(splitMessage)) {
      splitMessage = splitMessage[0].split('');
    }

    return splitMessage;
  }
}

export default Emp;
