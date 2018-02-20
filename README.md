# Mascot Bot

Mascot Bot is the future BronyCon Slack assistant currently under development. Developed in ES6 with Babel, and running on Node v6.7.0 or higher.

## Setup

1. [Create a bot user](https://my.slack.com/services/new/bot) in your Slack account.
2. Install Mascot-Bot on any computer or server.
3. Use the API token (xoxb-a-b) to execute the bot.

## Installing

```node
git clone git@github.com:imjoshdean/mascot-bot.git
cd mascot-bot
yarn // npm install if you aren't using yarn yet
```

## Running Mascot Bot

Where `xoxb-a-b` is your Slack bot API token:

```node
SLACK_TOKEN=xoxb-a-b npm run start-dev
```

### Optional User Environment Options

- `SLACK_TOKEN` - Slack API token needed to start the bot
- `DATABASE_NAME` - Name of the MongoDB database to utilize if using database.

## Mascot Bot

Mascot Bot extends [SlackBot](https://www.npmjs.com/package/slackbots). So all settings, properties, functions available to SlackBot are available to MascotBot including the following.

### Settings

- `name` - Name of the bot, defaults to "Mascot Bot."
- `token` - Slack API token utilized to connect to the service. If one is not provided, will attempt to use `SLACK_TOKEN` from the process.
- `useDatabase` - Whether or not to utilize a MongoDB database.
- `database` - The name of the database to use. If one is not provided, but `useDatabase` is true, it will attempt to use `DATABASE_NAME` from the process.
- `behaviors` - Custom behaviors written for the bot to enhance it's capabilities. Can be passed in in one of two ways: either the Behavior constructor function or as an object with the following signature:

```
{
  behavior: BehaviorClass,
  settings: {}
}
```

### Functions

- `setTopic(channelId, topic, isPublicRoom = true)` (return: Promise) - Sets the topic of a given public channel or private group.

## Behavior

Behaviors are extended custom functionality of Mascot Bot. Think of them like widgets or modules. These are useful for providing any number of features, such as custom interations with users or fetching and outputing data with commands (more on that later.

### Settings

These settings should be implemented in the constructor function before calling the parent constructor function, otherwise they will not be applied.

- `name` - Name of the behavior.
- `description` - Useful description of what the behavior is and does. Is used to describe the behavior to bot users.

### Properties

- `bot` - The instance of Mascot Bot that initialized the behavior.
- `settings` - The settings passed into the behavior.
- `name` - The name given to the behavior.
- `description` - The description given to the behavior.
- `jobs` - An array of cron-like jobs associated with the behavior.
- `commands` - An array of commands associated with the behavior.

### Functions

- `initialize(bot)` - Is called on instantiation of the behavior and can be used to set up additional features of the behavior.
- `deconstruct()` - Is called when the bot shuts down or disconnects from Slack.
- `addCommand(tag, description)` - Adds a command to the behavior. For example if you were to type `this.addCommand('foo', 'Do something for foo');` and a user typed `!foo!` in a channel your bot was in, execute would be called with the `foo` command passed in.
- `execute(command, message, channel, data)` - Is called when a command that is associated with the behavior is sent. The behavior should do something based on the command provided. For example, when a user types `!foo`, if your behavior has a `foo` command, the bot will call the behavior's execute function.
- `scheduleJob(cronSpec, callback)` - Schedules a job to be run utilizing a crontab (http://www.crontab-generator.org/).
- `cancelJob(job)` - Cancels a job on the behavior.
- `cancelAllJobs()` - Cancels all jobs on the behavior.

## Usage

```
import { MascotBot, Behavior } from 'mascot-bot';

class GreetBehavior extends Behavior {
  constructor(settings = {}) {
    settings.name = 'Greet Behavior';

    super(settings);

    this.addCommand('hello', 'Say hello back whenever someone types !hello');
  }

  execute(command, message, channel, data) {
    switch (command) {
    case 'hello':
      this.bot.postMessage(channel, `Hello to you too, <@${data.user}>!`, {
        icon_emoji: ':wave:'
      });
      break;
    default:
      break;
    }
  }
}

const bot = new MascotBot({
  name: 'Blank Bot',
  behaviors: [
    GreetBehavior
  ]
});

bot.initialize();

```