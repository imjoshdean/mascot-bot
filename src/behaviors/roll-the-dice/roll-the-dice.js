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
      this.bot.postMessage(channel, `You rolled a Natural 1!, Don't roll more than 100 dice or si`, {
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

  parseRoll(text) {
    const matchExp = /(\d+)[dD](\d+)/;

    if (text.match(matchExp)){
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
