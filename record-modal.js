module.exports = function (app, conn) {
  // Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
  app.action('open-record-modal', async ({ ack, body, client, payload }) => {
    try {
      const accountInfo = await conn.query(
        `SELECT Id, Name, Owner.Name, FORMAT(AnnualRevenue) FROM Account WHERE Id = '${payload.value}'`
      );

      const account = accountInfo.records[0];

      // Acknowledge the command request
      await ack();

      // Call views.open with the built-in client
      const result = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: account.Name,
            emoji: true
          },
          blocks: [
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Edit Record',

                    emoji: true
                  },
                  value: account.Id,
                  action_id: 'record-edit-start'
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'View in Salesforce',
                    emoji: true
                  },
                  url: `https://curious-fox-p8n9xu-dev-ed.lightning.force.com/lightning/r/Account/${account.Id}/view`
                }
              ]
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Owner*\n${account.Owner.Name}\n\n*Annual Revenue*\n${account.AnnualRevenue}\n`
                },
                {
                  type: 'mrkdwn',
                  text:
                    '*Some other field*\n$50,000\n\n*Some other field*\n$50,000\n'
                }
              ]
            }
          ]
        }
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  });
};
