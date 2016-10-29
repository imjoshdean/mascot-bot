import Behavior from '../behavior.js';

class RollTheDice extends Behavior {
  constructor(settings) {
    settings.name = 'Roll The Dice';

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);

    bot.on('message', (data) => {
      if (data.text && data.text.includes('rtd ')) {
        const roll = this.parseRoll(data.text),
          rolls = [];
        let results = '';

        roll.number = Math.min(100, roll.number);

        for (let i = 0; i < roll.number; i++) {
          rolls.push(Math.ceil(Math.random() * roll.sides));
        }


        results = rolls.join(', ');


        bot.postMessage(data.channel, `You rolled ${results}.`, {
          icon_emoji: ':game_die:'
        });
      }
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
