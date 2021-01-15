function makeEditBlocks(account) {
  const ratingDict = {
    '--None--': 0,
    Hot: 1,
    Warm: 2,
    Cold: 3
  };

  const ratingValue = {
    text: {
      type: 'plain_text',
      text: account.Rating,
      emoji: true
    },
    value: `value-${ratingDict[account.Rating]}`
  };

  return {
    title: {
      type: 'plain_text',
      text: account.Name,
      emoji: true
    },
    submit: {
      type: 'plain_text',
      text: 'Submit'
    },
    type: 'modal',
    callback_id: 'record-edited',
    blocks: [
      {
        type: 'input',
        element: {
          type: 'multi_users_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select users',
            emoji: true
          },
          action_id: 'multi_users_select-action'
        },
        label: {
          type: 'plain_text',
          text: 'Owner',
          emoji: true
        }
      },
      {
        dispatch_action: true,
        type: 'input',
        element: {
          type: 'plain_text_input',
          dispatch_action_config: {
            trigger_actions_on: ['on_character_entered']
          },
          initial_value: account.AnnualRevenue,
          action_id: 'plain_text_input-action'
        },
        label: {
          type: 'plain_text',
          text: 'Annual Revenue',
          emoji: true
        },
        block_id: 'revenue'
      },
      {
        type: 'input',
        element: {
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select an item',
            emoji: true
          },
          options: [
            {
              text: {
                type: 'plain_text',
                text: '--None--',
                emoji: true
              },
              value: 'value-0'
            },
            {
              text: {
                type: 'plain_text',
                text: 'Prospect',
                emoji: true
              },
              value: 'value-1'
            },
            {
              text: {
                type: 'plain_text',
                text: 'Customer - Direct',
                emoji: true
              },
              value: 'value-2'
            }
          ],
          action_id: 'static_select-action'
        },
        label: {
          type: 'plain_text',
          text: 'Type',
          emoji: true
        }
      },
      {
        type: 'input',
        element: {
          type: 'datepicker',
          initial_date: '1990-04-28',
          placeholder: {
            type: 'plain_text',
            text: 'Select a date',
            emoji: true
          },
          action_id: 'datepicker-action'
        },
        label: {
          type: 'plain_text',
          text: 'SLA Expiration Date',
          emoji: true
        }
      },
      {
        type: 'input',
        element: {
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select an item',
            emoji: true
          },
          initial_option: ratingValue,
          options: [
            {
              text: {
                type: 'plain_text',
                text: '--None--',
                emoji: true
              },
              value: 'value-0'
            },
            {
              text: {
                type: 'plain_text',
                text: 'Hot',
                emoji: true
              },
              value: 'value-1'
            },
            {
              text: {
                type: 'plain_text',
                text: 'Warm',
                emoji: true
              },
              value: 'value-2'
            },
            {
              text: {
                type: 'plain_text',
                text: 'Cold',
                emoji: true
              },
              value: 'value-3'
            }
          ],
          action_id: 'static_select-action'
        },
        label: {
          type: 'plain_text',
          text: 'Rating',
          emoji: true
        }
      }
    ]
  };
}

let account = {};

module.exports = function (app, conn) {
  // Listen for a button invocation with action_id `button_abc` (assume it's inside of a modal)
  app.action('open-record-modal', async ({ ack, body, client, payload }) => {
    try {
      const accountInfo = await conn.query(
        `SELECT Id, Name, Owner.Name, Rating, Type, FORMAT(AnnualRevenue) FROM Account WHERE Id = '${payload.value}'`
      );

      account = accountInfo.records[0];

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
                    `*Rating*\n${account.Rating}\n\n*Type*\n${account.Type}\n`
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

  app.action('record-edit-start', async ({ ack, body, client, payload }) => {
    // Acknowledge the button request
    await ack();

    try {
      // Call views.update with the built-in client
      const result = await client.views.push({
        // Pass the view_id
        trigger_id: body.trigger_id,
        // Pass the current hash to avoid race conditions
        // View payload with updated blocks
        view: makeEditBlocks(account)
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  });

  let shownError = false;

  app.view('record-edited', async ({ ack, body, client, payload }) => {
    const errors = {};
    errors['revenue'] = 'Enter a valid value.';

    // Acknowledge the button request
    if (!shownError) {
      ack({
        response_action: 'errors',
        errors: errors
      });
      shownError = true;
    } else {
      ack(); // close this modal - or also possible to set `response_action: 'clear'`
    }
  });
};
