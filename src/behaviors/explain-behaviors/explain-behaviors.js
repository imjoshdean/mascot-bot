import Behavior from '../behavior.js';

class ExplainBehaviors extends Behavior {
  constructor(settings) {
    settings.name = 'Explain Behaviors';
    settings.description = 'Explains the different behaviors and commands you can use';
    settings.listInFeatures = false;
    super(settings);

    this.commands.push({
      tag: 'help',
      description: `I'll list all of the commands you can ask me to do`
    });

    this.commands.push({
      tag: 'features',
      description: `I'll list all the features I'm able to do`
    });
  }

  execute(command, message, channel, messageData) {
    switch (command) {
    case 'help':
      this.explainBehaviors(channel, messageData);
      break;

    case 'features':
      this.explainFeatures(channel, messageData);
      break;

    default:
      break;
    }
  }

  explainBehaviors(channel, messageData) {
    let promise = Promise.resolve();
    let response = 'Hi there! I can help you out when you use the following commands:\n'

    this.bot._behaviorCommands.forEach(command => {
      response += `\`!${command.tag}\` - ${command.description}\n`;
    });

    return Promise.resolve(this.bot.postMessage(channel, response, {
      icon_emoji: ':question:',
      thread_ts: messageData.thread_ts
    }));
  }

  explainFeatures(channel, messageData) {
    const behaviors = this.bot.behaviors
      .filter(behavior => behavior.settings.listInFeatures !== false)
      .map(behavior => {
        let feature = `\`${behavior.name}\``;

        if (behavior.description) {
          feature += `: ${behavior.description}`;
        }

        return feature;
      }).join('\n ');

    return this.bot.postMessage(channel, `Here are some of the things I can help with. Remember, I need to be in your Slack channels in order to use them: \n${behaviors}`, {
      icon_emoji: ':robot_face:',
      thread_ts: messageData.thread_ts
    });
  }

}

export default ExplainBehaviors;
