import schedule from 'node-schedule';

class Behavior {
  constructor(settings = {}) {
    this.name = settings.name || 'Behavior Name';
    this.jobs = [];

    if (settings.bot) {
      this.bot = settings.bot;
      this.initialize(this.bot);
    }
  }

  initialize() { }

  deconstruct() { }

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
