import SlackBot from 'slackbots';
import mongoose from 'mongoose';

// We want to use native promises
mongoose.Promise = global.Promise;
const COMMAND_REGEX = /^!(\S+)/g;

/**
 * @module {Class} MascotBot MascotBot
 *
 * @signature `new MascotBot(settings)`
 * @param {Object} [settings = {}] MascotBot settings
 */

/**
 * @module {Class} MascotBot.Settings Settings
 * @property {String} [name = 'Mascot Bot']
 *
 * Name of the bot
 *
 * @property {String} token
 *
 * Slack API token utilized to connect to the service. If one is not provided,
 * will attempt to use SLACK_TOKEN from the process
 *
 * @property {Boolean} useDatabase
 *
 * Whether or not we should use a Mongo Database
 *
 * @property {String} database
 *
 * Name of the database that should be used. If one is not provided, will attempt
 * to use DATABASE_NAME from the process
 *
 * @property {Array<Behavior|Object>} behaviors
 *
 * Custom behaviors for our bot, can be either a Behavior constructor class on
 * it's own or a custom object with the following signature:
 *
 * ```
 * {
 *   behavior: BehaviorClass, // Behavior constructor class
 *   settings: Object         // Object of settings to be passed into the behavior
 * }
 * ```
 */
class MascotBot extends SlackBot {
  constructor(settings = {}) {
    const name = settings.name || 'Mascot Bot';
    let token = '';

    if (settings.useDatabase) {
      if (process.env.DATABASE_NAME) {
        settings.database = process.env.DATABASE_NAME;
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

  /**
   * @function MascotBot.log log
   * @parent MascotBot
   * @param {String} message Message to log out.
   * @param {Boolean} [error = false] Whether or not the log is an error.
   * @description Launches the bot to be used, connecting to a provided database
   * as well as initializes any behaviors provided to the bot.
   */
  log(message, error = false) {
    // eslint-disable-next-line no-console
    console[error ? 'error' : 'info'](message);
  }

  /**
   * @function MascotBot.launch launch
   * @parent MascotBot
   * @description Launches the bot to be used, connecting to a provided database
   * as well as initializes any behaviors provided to the bot.
   */
  launch() {
    this.on('start', () => {
      if (this.settings.useDatabase) {
        this._connectDatabase(this.settings.database, this.settings.databaseSettings);
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

  /**
   * @function MascotBot.setTopic setTopic
   * @parent MascotBot
   * @param {String} channelId Identifier of the public channel or private group.
   * @param {String} topic Topic message to set
   * @param {String} [isPublicRoom = true] Whether or not the topic is being set
   * to a public room or a private group
   * @description Makes an API call to set the topic of either a public channel
   * or private group.
   * @return {Promise} A promise that resolves whether or not the API call was successful
   */
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

  _connectDatabase(database, options) {
    if (options.user) {
      mongoose.connect(`mongodb://${options.user}:${options.password}@localhost/${database}`, options);
    }
    else {
      mongoose.connect(`mongodb://localhost/${database}`, options);
    }
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
