import Behavior from '../behavior.js';

class ExplainBehaviors extends Behavior {
  constructor(settings) {
    settings.name = 'Explain Behaviors';
    settings.description = 'Explains the different behaviors and commands you can use';
    super(settings);

    this.commands.push({
      tag: 'help',
      description: 'Explains all of my behaviors you can use'
    });

    this.commands.push({
      tag: 'features',
      description: `Lists all the features I'm able to do`
    });
  }

  execute(command, message, channel) {
    switch (command) {
    case 'help':
      this.explainBehaviors(channel);
      break;

    case 'features':
      this.explainFeatures(channel);
      break;

    default:
      break;
    }
  }

  explainBehaviors(channel) {
    let promise = Promise.resolve();

    promise = promise.then(() => {
      return this.bot.postMessage(channel, `${this.bot.name} is equipped with the following behaviors:`, {
        icon_emoji: ':question:'
      });
    });

    this.bot._behaviorCommands.forEach(command => {
      promise = promise.then(() => {
        return this.bot.postMessage(channel, `\`!${command.tag}\` - ${command.description}`);
      });
    });

    return promise;
  }

  explainFeatures(channel) {
    const behaviors = this.bot.behaviors.map(behavior => {
      let feature = `\`${behavior.name}\``;

      if (behavior.description) {
        feature += `: ${behavior.description}`;
      }

      return feature;
    }).join('\n ');

    return this.bot.postMessage(channel, `${this.bot.name} is equipped with the following behaviors: \n${behaviors}`, {
      icon_emoji: ':robot_face:'
    });
  }

}

export default ExplainBehaviors;
