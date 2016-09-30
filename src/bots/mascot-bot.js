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

    if (!settings.behaviors) {
      settings.behaviors = []
    }

    super({
      token,
      name
    });


    this.debugRoom = settings.debugRoom || 'drop-the-beatz';
    this.behaviors = settings.behaviors || [];
  }

  log(message, error) {
    console[error ? 'error' : 'log'](message);
  }

  launch() {
    this.on('start', () => {
      this._setupBehaviors();
    });

    this.on('close', () => {
      this._destroyBehaviors();
    })
  }

  _setupBehaviors() {
    let initializedBehaviors = []
    this.behaviors.forEach((behavior) => {
      let behaviorInstance = new behavior({
        bot: this
      });
      this.log(`Initializing ${behaviorInstance.name} behavior on bot.`);
      initializedBehaviors.push(behaviorInstance);
    });

    this.bheaviors = initializedBehaviors;
  }

  _destroyBehaviors() {
    for(let behavior in this.behaviors) {
      behavior.deconstruct();
    }
  }
}

export default MascotBot;
