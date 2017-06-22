import Behavior from '../behavior.js';

class RollTheDice extends Behavior {
  constructor(settings) {
    settings.name = 'Clap Hype';
    settings.description = `'cause 👏 sometimes 👏 you 👏 need 👏 emphasis!`;
    super(settings);

    this.commands.push({
      tag: 'clap',
      description: `I'll hype your message for you 👏👏👏`
    });
  }

  execute(command, message, channel, data) {
    const parsedMessage = this.parseMessage(message);

    this.bot.postMessage(channel, `${parsedMessage.join(' :clap: ')} :clap:`, {
      icon_emoji: ':clap:',
      thread_ts: data.thread_ts
    });
  }

  parseMessage(message) {
    let splitMessage = message.replace(/^!clap/gi, '').replace(/\s+/g, ' ').trim().split(' ');

    if (splitMessage.length === 1) {
      splitMessage = splitMessage[0].split('');
    }

    return splitMessage;
  }
}

export default RollTheDice;
