require('dotenv').config()

var jsforce = require('jsforce');
var conn = new jsforce.Connection();

const { App, LogLevel } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});

conn.login('1garrett.chan@salesforce.com', 'test1234NztEftnZU3rkfB4QHk1bQZN6', function(err, res) {
  if (err) { return console.error(err); }
  console.log(conn.instanceUrl);
});

require('./home')(app, conn);
require('./record-modal')(app, conn);

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();