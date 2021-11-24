// common.js should be put near index.js when deploying.
const common = require('./common.js');

const CALENDARS_TABLE = 'user_calendars';

exports.handler = async (event) => {
  try {
    console.log(event);
    const requestBody = JSON.parse(event.body);

    const result = await common.makeQuery(new common.Query(
      `INSERT INTO ${CALENDARS_TABLE} (user_id, calendar_id) VALUES ($1, $2);`,
      [requestBody.user_id, requestBody.calendar_id]
    ));
    console.log(JSON.stringify(result));
    return common.formResponse(201, {});
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};


// local testing
// exports.handler({
//   body: JSON.stringify({
//     user_id: 'f309e4e7-8d75-4ae8-9f0e-8e9d259d1da4',
//     calendar_id: 'test calendar 2'
//   })
// });