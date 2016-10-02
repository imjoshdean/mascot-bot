import Behavior from './behavior.js';

class RandomChannel extends Behavior {
  constructor(settings = {}) {
    settings.name = settings.name || 'Random Channel';

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);

    let channels = bot._api('channels.list', { token: bot.token, exclude_archived: 1 });

    channels.then(function(data) {
      let randomChannel = data.channels[Math.floor(Math.random() * data.channels.length)];

      if(['all-staff', 'announcements'].includes(randomChannel.name)) {
        let randomChannel = data.channels[Math.floor(Math.random() * data.channels.length)];
      }

      let channelPurpose = randomChannel.purpose.value === '' ? '[no purpose set, but it\'s probably pretty good anyway]'
        : randomChannel.purpose.value;
      let period = ['.', '!', '?'].includes(channelPurpose.slice(-1)) ? '' : '.';

      bot.say('#drop-the-beatz', `The random channel of the day is <#${randomChannel.id}|${randomChannel.name}>: ` +
        `${channelPurpose}${period} Check it out, yo!`, {
        icon_emoji: ':slack:'
      });
    }, function(error) {
      bot.log(error, true);
    });
  }
}

export default RandomChannel;
