// common.js should be put near index.js when deploying.
const common = require('./common.js');
const notifications = require('./notifications.js');


exports.handler = async (event) => {
  try {
    console.log(event);
    const requestBody = JSON.parse(event.body);

    const notifResponse = await notifications.updateNotifications(requestBody.ids)
      .catch(common.handlePromiseReject('Could not update the meeting'));

    return common.formResponse(200, JSON.stringify(requestBody));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};

