import Karma from './models/karma.js';

export default function () {
  Karma.findOrCreate({
    slackId: 'foo'
  }).then((karma) => {
    karma.increment(1, 'first one\'s free');
    karma.decrement(1, 'works both ways');
    karma.increment(1, 'developed karma module');
    karma.increment(1, 'pretty awesome');
    console.log(karma);
    karma.save();
  });
}
