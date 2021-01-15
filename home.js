module.exports = function (app, conn) {
  function createAccountRow({ Name, Id }) {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: Name
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'View and Edit',
          emoji: true
        },
        value: Id,
        action_id: 'open-record-modal'
      }
    };
  }

  // Listen for users opening your App Home
  app.event('app_home_opened', async ({ event, client }) => {
    try {
      const accounts = await conn.query('SELECT Id, Name FROM Account ORDER BY LastViewedDate DESC LIMIT 10');

      // Call views.publish with the built-in client
      const result = await client.views.publish({
        // Use the user ID associated with the event
        user_id: event.user,
        view: {
          type: 'home',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: 'Recently Viewed Accounts!',
                emoji: true
              }
            },
            createAccountRow(accounts.records[0]),
            createAccountRow(accounts.records[1]),
            createAccountRow(accounts.records[2]),
            createAccountRow(accounts.records[3]),
            createAccountRow(accounts.records[4]),
            createAccountRow(accounts.records[5])

          ]
        }
      });

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  });
};
