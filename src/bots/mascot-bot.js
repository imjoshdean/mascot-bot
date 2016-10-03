import SlackBot from 'slackbots';

const DEBUG_WHITELIST = [
    'sheva',
    'imjoshdean',
    'drop-the-beatz'
  ],
  DEBUG_OVERLOAD_FUNCTIONS = {
    postMessage: {
      debugError: 'postMessage disabled API limited in debug mode ' +
          'use postTo instead',
      includeName: false
    },
    postTo: {
      debugError: 'postTo API limited in debug mode',
      includeName: true
    },
    postMessageToGroup: {
      debugError: 'postMessageToGroup API limited in debug mode',
      includeName: true
    },
    postMessageToChannel: {
      debugError: 'postMessageToChannel API limited in debug mode',
      includeName: true
    },
    postMessageToUser: {
      debugError: 'postMessageToUser API limited in debug mode',
      includeName: true
    }
  };

class MascotBot extends SlackBot {
  constructor(settings = {}) {
    const name = settings.name || 'Mascot Bot';
    let token = '';

    if (settings.token) {
      token = settings.token;
    }
    else if (process.env.TOKEN) {
      token = process.env.TOKEN;
    }
    else {
      throw new Error('No Slack API token provided');
    }

    super({
      token,
      name
    });

    this.debug = settings.debug;

    if (this.debug) {
      this._overloadMessagingForDebug();
    }

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
      sendee = personOrPlace.substring(1, personOrPlace.length);

    if (identifier !== '@' || identifier !== '#') {
      return this.postTo(sendee, message, params);
    }

    const error = `Unable to end message to ${sendee}, ` +
        `unsure where to send it with the ${identifier} identifier`;

    this.log(error, true);

    return Promise.reject(error);
  }

  _overloadMessagingForDebug() {
    for (const func in DEBUG_OVERLOAD_FUNCTIONS) {
      if ({}.hasOwnProperty.call(DEBUG_OVERLOAD_FUNCTIONS, func)) {
        const funcInfo = DEBUG_OVERLOAD_FUNCTIONS[func];

        ((funcName, info) => {
          if (info.includeName) {
            this[funcName] = (name, ...args) => {
              if (!DEBUG_WHITELIST.includes(name)) {
                this.log(info.debugError, true);

                return Promise.reject();
              }

              return super[funcName](name, ...args);
            };
          }
          else {
            this[funcName] = () => {
              this.log(info.debugError, true);

              return Promise.reject();
            };
          }
        })(func, funcInfo);
      }
    }
  }

  _setupBehaviors() {
    const initializedBehaviors = [];

    this._behaviors.forEach((Behavior) => {
      const behaviorInstance = new Behavior({
        bot: this
      });
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
