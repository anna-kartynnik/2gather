// common.js should be put near index.js when deploying.
const common = require('./common.js');
const { getCalendar, createCalendar } = require('./calendars.js');


exports.handler = async (event) => {
  try {
    console.log(event);
    const requestBody = JSON.parse(event.body);

    if (!requestBody.user_id || !requestBody.calendar_id) {
      return common.formResponse(400, JSON.stringify({
        message: 'Required parameters are not specified'
      }));
    }

    const calendars = await getCalendar(requestBody.user_id, requestBody.calendar_id);
    if (calendars.length > 0) {
      return common.formResponse(201, JSON.stringify({
        message: 'Already created'
      }));
    }

    const result = await createCalendar(requestBody.user_id, requestBody.calendar_id);
    console.log(JSON.stringify(result));
    return common.formResponse(201, JSON.stringify({
      message: 'Created'
    }));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};
