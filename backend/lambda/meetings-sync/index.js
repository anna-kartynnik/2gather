// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings_utils = require('./meetings.js');
const google_utils = require('./google_utils.js');


exports.handler = async (event) => {
  try {

    const meetings = await meetings_utils.getMeetingsByStatus(meetings_utils.MeetingStatus.CONFIRMED).catch((err) => {
      console.log('Could not get meetings with status confirmed', err);
      throw err;
    });
    console.log(meetings);

    for (let meeting of meetings) {
      const calendars = await meetings_utils.getMeetingParticipantsWithCalendars(
        meeting.id
      ).catch((err) => {
        console.log('Could not get meetings calendars', err);
        throw err;
      });
      console.log(calendars);
      const response = await google_utils.createEvent(
        calendars,
        meeting
      ).catch((err) => {
        console.log('Could not save event', err);
        throw err;
      });
      console.log(response);

      break;
    }

    // console.log(JSON.stringify(meeting));
    // return common.formResponse(201, JSON.stringify(meeting));
  } catch (err) {
    console.log('Error: ' + err);

    // return common.formResponse(500, JSON.stringify({
    //   message: err && err.message ? err.message : 'An error has occurred.'
    // }));
  }
};