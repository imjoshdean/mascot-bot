# Beatz Bot

Beatz Bot is the future BronyCon Slack assistant currently under development. Developed in ES6 with Babel, and running on Node v6.7.0 or higher.

## Setup

1. [Create a bot user](https://my.slack.com/services/new/bot) in your Slack account.
2. Install Beatz-Bot on any computer or server.
3. Use the API token to execute the bot.

## Installing

```node
git clone git@github.com:imjoshdean/beatz-bot.git
cd beatz-bot
yarn // npm install if you aren't using yarn yet
```

## Running Beatz Bot

Where `{token}` is your Slack bot API token:

```node
SLACK_TOKEN={token} npm run start-dev
```
