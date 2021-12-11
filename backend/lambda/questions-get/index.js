// common.js should be put near index.js when deploying.
const common = require('./common.js');
const { getMeetingQuestions } = require('./meetings.js');



exports.handler = async (event) => {
  try {
    console.log(event);
    const queryString = event.queryStringParameters;

    const userId = queryString.user_id;
    if (!userId) {
      return common.formResponse(400, JSON.stringify({
        message: '`user_id` parameter is required'
      }));
    }

    const meetingId = event.pathParameters.id;

    if (!meetingId) {
      return common.formResponse(400, JSON.stringify({
        message: 'Meeting identificator is required'
      }));
    }

    const questions = await getMeetingQuestions(userId, meetingId).catch(
      common.handlePromiseReject`Could not get meeting questions (meeting id is ${meetingId})`
    );

    //console.log(JSON.stringify(meetings));
    return common.formResponse(200, JSON.stringify(questions));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};
