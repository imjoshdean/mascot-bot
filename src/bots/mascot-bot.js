import SlackBot from 'slackbots';

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

    this.debugRoom = settings.debugRoom || 'drop-the-beatz';
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

  say(personOrPlace = '', message = '', params = {}) {
    if (!personOrPlace) {
      this.log('personOrPlace required to say anything', true);
    }

    const identifier = personOrPlace.slice(0, 1),
      sendee = personOrPlace.substring(1, personOrPlace.length);

    if (identifier === '@') {
      this.postMessageToUser(sendee, message, params);
    }
    else if (identifier === '#') {
      this.postTo(sendee, message, params);
    }
    else {
      this.log(`Unable to end message to ${sendee}, ` +
        `unsure where to send it with the ${identifier} identifier`, true);
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
