import Behavior from '../behavior.js';
import moment from 'moment';

class DaysUntil extends Behavior {
  constructor(settings = {}) {
    settings.name = 'Days Until';
    settings.description = 'Announces the days until the convention starts';
    settings.sayInChannel = settings.sayInChannel.replace('#', '');

    super(settings);

    this.commands.push({
      tag: 'countdown',
      description: `I'll tell you how many more days until this year's BronyCon`
    });
  }

  initialize(bot) {
    super.initialize(bot);

    this.scheduleJob('33 20 * * *', () => {
      this.updateTopic(bot);
    });
  }

  calculateDaysUntil() {
    const conDate = moment(this.settings.conDate),
      today = moment();

    return conDate.diff(today, 'days') + 1;
  }

  execute(command, message, channel, messageData) {
    const days = this.calculateDaysUntil();
    let countdownMessage = '',
      hour = Math.round((days / this.settings.maxDays) * 12);

    // If we reach 0, it should be 12, since we're using clock emojis
    hour = hour || 12;

    if (days === 1) {
      countdownMessage = '1 day until BronyCon';
    }
    else if (days > 1) {
      countdownMessage = `${days} days until BronyCon`;
    }

    if (command === 'countdown') {
      this.bot.postMessage(channel, `${countdownMessage} – clock is ticking!`, {
        icon_emoji: `:clock${hour}:`,
        thread_ts: messageData.thread_ts
      });

      this.postMajora(days, channel);
    }
  }

  // You've met with a terrible fate, haven't you?
  postMajora(days, channel) {
    let message = '';

    switch (days) {
      case 1:
        message = 'https://i.imgur.com/eleo2q6.png';
        break;
      case 2:
        message = 'https://i.imgur.com/mXzrU6d.png';
        break;
      case 3:
        message = 'https://i.imgur.com/IhLCQcu.png';
        break;
      default:
        message = '';
        break;
    }

    if (message) {
      this.bot.postMessage(channel, `${message}`, {
        icon_emoji: ':majoras_mask_bw:'
      });
    }
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

      this.postMajora(days, channel.id);

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
