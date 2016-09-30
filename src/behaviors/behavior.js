class Behavior {
  constructor(settings = {}) {

    this.name = settings.name || 'Behavior Name';

    if(settings.bot) {
      this.initialize(settings.bot)
    }
  }

  initialize(bot) {
    
    console.log('base initialize');
  }

  deconstruct() {

  }
}


export default Behavior;
