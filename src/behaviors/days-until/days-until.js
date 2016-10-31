import Behavior from '../behavior.js';
import moment from 'moment';

class DaysUntil extends Behavior {
  constructor(settings = {}) {
    settings.name = 'Days Until';
    settings.sayInChannel = settings.sayInChannel.replace('#', '');

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);

    this.scheduleJob('*/1 * * * *', () => {
      this.updateTopic(bot);
    });
  }

  calculateDaysUntil() {
    const conDate = moment(this.settings.conDate),
      today = moment();

    return conDate.diff(today, 'days') + 1;
  }

  updateTopic(bot) {
    const getFunction = this.settings.isPublic ? 'getChannel' : 'getGroup',
      topicFunction = this.settings.isPublic ? 'channels.setTopic' : 'groups.setTopic';

    bot[getFunction](this.settings.sayInChannel).then((channel) => {
      // All data is cached with no way to refresh, temporary work around
      bot.groups = undefined;
      bot.channels = undefined;
      const days = this.calculateDaysUntil();
      let topic = channel.topic.value,
        message = '';

      if (days === 1) {
        message = '1 day until BronyCon!';
      }
      else if (days > 1) {
        message = `${days} days until BronyCon!`;
      }

      topic = topic.replace(/\d+ days? until BronyCon!/gi, message);

      bot._api(topicFunction, {
        token: bot.token,
        channel: channel.id,
        topic
      }, (error) => {
        bot.log(topicFunction, true);
        bot.log(error, true);
      });
    }, (error) => {
      bot.log(getFunction, true);
      bot.log(error, true);
    });
  }

}

export default DaysUntil;
