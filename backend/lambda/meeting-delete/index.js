// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings = require('./meetings.js');


exports.handler = async (event) => {
  try {
    console.log(event);
    const meetingId = event.pathParameters.id;

    if (!meetingId) {
      return common.formResponse(400, JSON.stringify({
        message: 'Meeting id is required'
      }));
    }

    const meetingResponse = await meetings.deleteMeeting(meetingId).catch((err) => {
      console.log('Could not delete the meeting', err);
      throw err;
    });

    return common.formResponse(204, JSON.stringify({id: meetingId}));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};

