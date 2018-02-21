import Behavior from '../behavior.js';

class RollTheDice extends Behavior {
  constructor(settings) {
    settings.name = 'Roll The Dice';
    settings.description = 'A simple dice rolling behavior';
    super(settings);

    this.commands.push({
      tag: 'rtd',
      description: 'I\'ll roll some dice for you and add them up. Try `!rtd 2d6` to roll ' +
        'two six sided dice or `!rtd 5d8` to roll five eight sided dice'
    });
  }

  execute(command, message, channel, data) {
    const roll = this.parseRoll(message),
      rolls = [];
    let results = '',
      sum = 0;

    if (roll.number > 100 || roll.sides > 100) {
      this.bot.postMessage(channel, `Don't be a dick, no more than 100 dice or 100 sides`, {
        icon_emoji: ':game_die:',
        thread_ts: data.thread_ts
      });

      roll.number = Math.min(100, roll.number);
      roll.sides = Math.min(100, roll.sides);
    }

    for (let i = 0; i < roll.number; i++) {
      rolls.push(Math.ceil(Math.random() * roll.sides));
    }

    results = rolls.join(', ');

    sum = rolls.reduce((a, b) => a + b);
    results += ` (${sum})`;

    this.bot.postMessage(channel, `You rolled ${results}.`, {
      icon_emoji: ':game_die:',
      thread_ts: data.thread_ts
    });
  }

execute(command, message, channel, data) {
    const roll = this.parseRoll(message),
      rolls = [];
    let results = '',
      sum = 0;

    if (roll.number > 0 || roll.sides > 0) {
      this.bot.postMessage(channel, `Please enter number of dice being rolled and Number of Sides like "!rtd 1d5)`, {
        icon_emoji: ':game_die:',
        thread_ts: data.thread_ts
      });

      roll.number = Math.min(1, roll.number);
      roll.sides = Math.min(5, roll.sides);
    }

    for (let i = 0; i < roll.number; i++) {
      rolls.push(Math.ceil(Math.random() * roll.sides));
    }

    results = rolls.join(', ');

    sum = rolls.reduce((a, b) => a + b);
    results += ` (${sum})`;

    this.bot.postMessage(channel, `You rolled ${results}.`, {
      icon_emoji: ':game_die:',
      thread_ts: data.thread_ts
    });
  }

  parseRoll(text) {
    const matchExp = /(\d+)[d|D](\d+)/;

    if (text.match(matchExp).length > 1) {
      let [,number, sides] = text.match(matchExp);

      number = +number;
      sides = +sides;

      return {
        number,
        sides
      };
    }

    return {
      number: 0,
      sides: 0
    };
  }
}

export default RollTheDice;
