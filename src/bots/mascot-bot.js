import SlackBot from 'slackbots';
import mongoose from 'mongoose';
import karma from '../behaviors/karma/karma.js';

const COMMAND_REGEX = /^!(\S+)/g;

class MascotBot extends SlackBot {
  constructor(settings = {}) {
    const name = settings.name || 'Mascot Bot';
    let token = '';

    if (settings.useDatabase) {
      if (process.env.DATABASE_NAME) {
        settings.database = process.env.DATABASE_NAME
      }
      else if (!settings.database) {
        throw new Error('No database name provided');
      }
    }

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

    this.settings = settings;
    this._behaviors = settings.behaviors || [];
    this._behaviorCommands = [];
  }

  log(message, error) {
    // eslint-disable-next-line no-console
    console[error ? 'error' : 'info'](message);
  }

  launch() {
    this.on('start', () => {
      if (this.settings.useDatabase) {
        this._connectDatabase(this.settings.database, this.settings.databaseSettings);
        setTimeout(() => {
          karma();
        }, 1000);
      }
      this._setupBehaviors();

      // Mascot bot will listen whenever any message comes through and parse it
      // to see if any commands get issued in the message. If one does, it will
      // attempt to find the associated behavior and send it to the behavior to
      // execute the command.
      this.on('message', data => {
        if (data.text) {
          const message = data.text.toLowerCase();
          let [match] = message.match(COMMAND_REGEX) || [];

          // If the message starts with a command, iterate over all the commands
          // and attempt to find a matching command to execute it.
          if (match) {
            match = match.replace('!', '');

            this._behaviorCommands.forEach(command => {
              if (command.tag === match) {
                command.behavior.execute(command.tag, data.text, data.channel, data);

                return false;
              }

              return true;
            });
          }
        }
      });
    });

    this.on('close', () => {
      mongoose.connection.close();
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

  _connectDatabase(database, options) {
    mongoose.connect(`mongodb://localhost/${database}`, options);
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

      this._behaviorCommands.push(...behaviorInstance.commands.map(command => {
        return {
          tag: command.tag,
          description: command.description,
          behavior: behaviorInstance
        };
      }));

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
