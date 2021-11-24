// common.js should be put near index.js when deploying.
const common = require('./common.js');
const { getMeetingsByCreator } = require('./meetings.js');


exports.handler = async (event) => {
  try {
    console.log(event);
    const queryString = event.queryStringParameters;

    const meetings = await getMeetingsByCreator(queryString.creator_id);
    //console.log(JSON.stringify(meetings));
    return common.formResponse(200, JSON.stringify(meetings));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};
