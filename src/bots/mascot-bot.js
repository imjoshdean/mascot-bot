import SlackBot from 'slackbots';

class MascotBot extends SlackBot {
  constructor(settings = {}) {
    const name = settings.name || 'Mascot Bot';
    let token = '';

    if (settings.token) {
      token = settings.token;
    }
    else if (process.env.SLACK_TOKEN) {
      token = process.env.SLACK_TOKEN;
    }
    else {
      throw new Error('No Slack API token provided');
    }

    super({
      token,
      name
    });

    this._behaviors = settings.behaviors || [];
  }

  log(message, error) {
    // eslint-disable-next-line no-console
    console[error ? 'error' : 'info'](message);
  }

  launch() {
    this.on('start', () => {
      this._setupBehaviors();
    });

    this.on('close', () => {
      this._destroyBehaviors();
    });
  }

  setTopic(channelId, topic, isPublicRoom = true) {
    const token = this.token,
      channel = channelId;

    if (!channel) {
      this.log('Channel ID not provided', true);
    }

    return this._api(isPublicRoom ? 'channels.setTopic' : 'groups.setTopic', {
      token,
      channel,
      topic
    });
  }

  say(personOrPlace = '', message = '', params = {}) {
    if (!personOrPlace) {
      this.log('personOrPlace required to say anything', true);
    }

    const identifier = personOrPlace.slice(0, 1),
      sendee = personOrPlace.substring(1, personOrPlace.length),
      error = `Unable to end message to ${sendee}, ` +
        `unsure where to send it with the ${identifier} identifier`;

    if (identifier !== '@' || identifier !== '#') {
      return this.postTo(sendee, message, params);
    }

    this.log(error, true);

    return Promise.reject(error);
  }

  _setupBehaviors() {
    const initializedBehaviors = [];

    this._behaviors.forEach((Behavior) => {
      let behaviorInstance;

      // If Behavior is an object, we can assume that it has a behavior
      // property and a settings property. In the event that there is no
      // behavior property, we'll skip it and move on
      if (!(Behavior instanceof Function)) {
        const BehaviorClass = Behavior.behavior,
          behaviorSettings = Behavior.settings || {};

        if (BehaviorClass === undefined) {
          this.log(`Behavior class not passed in, skipping.`, true);
          return;
        }

        behaviorSettings.bot = this;
        behaviorInstance = new BehaviorClass(behaviorSettings);
      }
      else {
        behaviorInstance = new Behavior({
          bot: this
        });
      }

      this.log(`Initializing ${behaviorInstance.name} behavior on bot.`);
      initializedBehaviors.push(behaviorInstance);
    });

    this.behaviors = initializedBehaviors;
  }

  _destroyBehaviors() {
    this.behaviors.forEach((behavior) => {
      behavior.deconstruct();
    });
  }
}

export default MascotBot;
