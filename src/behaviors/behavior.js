import schedule from 'node-schedule';

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

  initialize() { }

  deconstruct() { }

  execute(command, message, channel, data) {
    // eslint-disable-next-line no-console
    console.warn(`execute not implemented for this behavior, ${command} dropped`);
  }

  scheduleJob(cronSpec, callback) {
    const job = schedule.scheduleJob(cronSpec, callback);

    this.jobs.push(job);

    return job;
  }

  cancelJob(job) {
    const jobs = this.jobs;

    job.cancel();
    jobs.splice(jobs.indexOf(job), 1);
  }

  cancelAllJobs() {
    this.jobs.forEach((job) => {
      job.cancel();
    });

    this.jobs = [];
  }
}


export default Behavior;
