// common.js should be put near index.js when deploying.
const common = require('./common.js');
const { getMeetingById, getMeetingParticipants } = require('./meetings.js');


exports.handler = async (event) => {
  try {
    console.log(event);
    const meetingId = event.pathParameters.id;

    if (!meetingId) {
      return common.formResponse(400, JSON.stringify({
        message: 'Meeting identificator is required'
      }));
    }

    const meeting = await getMeetingById(meetingId).catch((err) => {
      console.log(`Could not get meeting by id ${meetingId}`, err);
      throw err;
    });
    const participants = await getMeetingParticipants(meetingId).catch((err) => {
      console.log(`Could not get meeting participants for meeting with id ${meetingId}`, err);
      throw err;
    });
    meeting.participants = participants;
    //console.log(JSON.stringify(meetings));
    return common.formResponse(200, JSON.stringify(meeting));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};