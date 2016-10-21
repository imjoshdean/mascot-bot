import Behavior from '../behavior.js';

class RandomChannel extends Behavior {
  constructor(settings = {}) {
    settings.name = 'Random Channel';

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);

    this.scheduleJob('* * * * *', () => {
      bot.say(this.settings.sayInChannel, 'Once a minute, I\'ll say a random room name');

      this.sayRandomChannel(bot);
    });
  }

  sayRandomChannel(bot) {
    const channels = bot._api('channels.list', { token: bot.token, exclude_archived: 1 });

    channels.then(data => {
      let randomChannel;

      do {
        randomChannel = data.channels[Math.floor(Math.random() * data.channels.length)];
      } while (['all-staff', 'announcements'].includes(randomChannel.name));

      const purposeless = '[no purpose set, but it\'s probably pretty good anyway]',
        channelPurpose = randomChannel.purpose.value === '' ? purposeless
            : randomChannel.purpose.value,
        period = ['.', '!', '?'].includes(channelPurpose.slice(-1)) ? '' : '.',
        randomChannelMessage = `The random channel of the day is ` +
          `<#${randomChannel.id}|${randomChannel.name}>: ` +
          `${channelPurpose}${period} Check it out, yo!`;

      bot.say(this.settings.sayInChannel, randomChannelMessage, {
        icon_emoji: ':slack:'
      });
    }, error => {
      bot.log(error, true);
    });
  }
}

export default RandomChannel;
