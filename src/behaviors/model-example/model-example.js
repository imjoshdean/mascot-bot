import Behavior from '../behavior.js';
import Person from './models/person.js';

class ModelExample extends Behavior {
  constructor(settings) {
    settings.name = 'ModelExample';

    super(settings);
  }

  initialize(bot) {
    super.initialize(bot);

    const person = new Person({
      firstName: 'Josh',
      lastName: 'Dean'
    });

    person.save().then(() => {
      Person.find({}).then((models) => {
        console.log('models', models);
      });
    });
  }
}

export default ModelExample;
