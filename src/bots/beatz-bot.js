import SlackBot from 'slackbots';

class BeatzBot extends SlackBot {
  constructor(settings = {}) {
    const name = settings.name || 'Beatz Bot';
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
  }

  launch() {
    console.log('launching');
    this.on('start', () => {

      console.log('launched');
      const name = this.name,
        message = `Beep boop, ${name} Initialized`;
      this.postTo(this.debugRoom, message, {as_user: true});
    });
  }
}

export default BeatzBot;
