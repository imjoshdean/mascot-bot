import Behavior from '../behavior.js';

const EMPH_CMD_RE = /!(:[\w-]+:) /;

class Emphasis extends Behavior {
  constructor(settings) {
    settings.name = 'Emphasis Emoji';
    settings.description = `'cause sometimes you need emphasis!`;
    super(settings);
  }

  initialize(bot) {
    bot.on('message', this.emphasize.bind(this));
  }

  emphasize(messageData) {
    const match = EMPH_CMD_RE.exec(messageData.text);
    if(match === null) {
      return;
    }
    const [,emoji] = match;

    const parsedMessage = this.parseMessage(messageData.text, emoji);
    this.bot.postMessage(messageData.channel, `${parsedMessage.join(` ${emoji} `)} ${emoji}`, {
      icon_emoji: emoji,
      thread_ts: messageData.thread_ts
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

export default Emphasis;
