import schedule from 'node-schedule';

/**
 * @module {Class} Behavior Behavior
 *
 * @signature `new Behavior(settings)`
 * @param {Object} [settings = {}] Behavior settings
 */

/**
 * @module {Class} Behavior.Settings Settings
 * @property {String} [name = 'Behavior Name']
 *
 * Name of the behavior
 *
 * @property {String} [description = '']
 *
 * Useful description of what the behavior is and does. Is used to describe the
 * behavior to bot users.
 *
 * @property {String} token
 *
 * Slack API token utilized to connect to the service. If one is not provided,
 * will attempt to use SLACK_TOKEN from the process
 *
 * @property {MascotBot} bot
 *
 * Instance of the bot that is initializing this behavior.
 */
class Behavior {
  constructor(settings = {}) {
    this.name = settings.name || 'Behavior Name';
    this.description = settings.description || '';
    this.jobs = [];
    this.commands = [];

    this.settings = settings;
    this.bot = this.settings.bot;

    if (this.bot) {
      this.initialize(this.bot);
    }
  }

  /**
   * @function Behavior.initialize initialize
   * @parent Behavior
   * @param {MascotBot} bot Instance of the bot that is passed into the behavior
   * @description Function is ran on instantiation of the behavior.
   */
  initialize() { }

  /**
   * @function Behavior.deconstruct deconstruct
   * @parent Behavior
   * @param {MascotBot} bot Instance of the bot that is passed into the behavior
   * @description Function is ran when a bot closes it's connection from Slack.
   */
  deconstruct() { }

  /**
   * @function Behavior.addCommand addCommand
   * @parent Behavior
   * @param {String} The tag that this behavior should respond to when typed at the start of
   * a message
   * @param {String} description A useful description of what the command is and
   * does. Is used to describe the command to bot users.
   * @description Associates a command to the behavior. For example if you were
   * to type `this.addCommand('foo', 'Do something for foo');`
   * If a user typed `!foo!` in a channel your bot was in, execute would be called
   * with the `foo` command passed in.
   */
  addCommand(tag, description) {
    this.commands.push({
      tag,
      description
    });
  }

  /**
   * @function Behavior.execute execute
   * @parent Behavior
   * @param {String} command The name of the command to be executed by the behavior
   * @param {String} message The full message associated with the command
   * @param {String} channel The channel ID the message was posted to.
   * @param {Object} data All additional data associated with the WebSockt `onMessage` call
   * @description Execute is a function that is called when a command that is associated
   * with the behavior is sent. The behavior should do something based on the command
   * provided.
   */
  execute(command, message, channel, data) {
    // eslint-disable-next-line no-console
    console.warn(`execute not implemented for this behavior, ${command} dropped`);
  }

  /**
   * @function Behavior.scheduleJob scheduleJob
   * @parent Behavior
   * @param {String} cronSpec A crontab that specifies when the job should run
   * @param {Function} callback The function the job should call
   * @description Schedules a job to be run utilizing a crontab
   * (http://www.crontab-generator.org/). This is helpful for behaviors that
   * need to run on a schedule or several times a day.
   * @return {Object} An object that represents the cron job
   */
  scheduleJob(cronSpec, callback) {
    const job = schedule.scheduleJob(cronSpec, callback);

    this.jobs.push(job);

    return job;
  }

  /**
   * @function Behavior.cancelJob cancelJob
   * @parent Behavior
   * @param {Object} job An object representing a cron job
   * @description Cancels a single job associated to this behavior
   */
  cancelJob(job) {
    const jobs = this.jobs;

    job.cancel();
    jobs.splice(jobs.indexOf(job), 1);
  }

  /**
   * @fucntion Behavior.cancelAllJobs cancelAllJobs
   * @parent Behavior
   * @description Cancels all jobs associated to this behavior
   */
  cancelAllJobs() {
    this.jobs.forEach((job) => {
      job.cancel();
    });

    this.jobs = [];
  }
}


export default Behavior;
