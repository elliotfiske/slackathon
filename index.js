require('dotenv').config()

var jsforce = require('jsforce');
var conn = new jsforce.Connection();

const { App, LogLevel } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});

// Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
app.action('button_abc', async ({ ack, body, client }) => {
  // Acknowledge the button request
  await ack();

  try {
    // Call views.update with the built-in client
    const result = await client.views.push({
      // Pass the view_id
      trigger_id: body.trigger_id, 
      // Pass the current hash to avoid race conditions
      // View payload with updated blocks
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Updated modal'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'You updated the modal!'
            }
          },
          {
            type: 'image',
            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
            alt_text: 'Yay! The modal was updated'
          }
        ]
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
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