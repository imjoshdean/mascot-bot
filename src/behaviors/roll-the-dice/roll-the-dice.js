import Behavior from '../behavior.js';

class RollTheDice extends Behavior {
  constructor(settings) {
    settings.name = 'Roll The Dice';
    settings.description = 'A simple dice rolling behavior';
    super(settings);

    this.commands.push({
      tag: 'rtd',
      description: 'Rolls dice and outputs the results as well as the sum of those dice ' +
        '(e.g. `!rtd 2d6` will output rolling two six sided dice)'
    });
  }

  execute(command, message, channel) {
    const roll = this.parseRoll(message),
      rolls = [];
    let results = '',
      sum = 0;

    if (roll.number > 100 || roll.sides > 100) {
      this.bot.postMessage(channel, `Don't be a dick, no more than 100 dice or 100 sides`, {
        icon_emoji: ':game_die:'
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
      icon_emoji: ':game_die:'
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
