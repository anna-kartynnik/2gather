// common.js should be put near index.js when deploying.
const common = require('./common.js');
const { getCalendarsByUser } = require('./calendars.js');


exports.handler = async (event) => {
  try {
    console.log(event);
    const queryString = event.queryStringParameters;

    if (!queryString.user_id) {
      return common.formResponse(400, JSON.stringify({
        message: '`user_id` parameter is required'
      }));
    }

    const calendars = await getCalendarsByUser(queryString.user_id);

    console.log(calendars);

    return common.formResponse(200, JSON.stringify(calendars));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};
