// common.js should be put near index.js when deploying.
const common = require('./common.js');
const { getMeetingsByParticipant, MeetingStatus, getProposedTimes } = require('./meetings.js');


exports.handler = async (event) => {
  try {
    console.log(event);
    const queryString = event.queryStringParameters;

    if (!queryString.user_id) {
      return common.formResponse(400, JSON.stringify({
        message: '`user_id` parameter is required'
      }));
    }

    const meetings = await getMeetingsByParticipant(queryString.user_id, queryString.status);

    console.log(meetings);

    // let meetingsResponse = [];
    // if (!queryString.status || queryString.status === MeetingStatus.PROPOSED) {
    //   const proposedTimes = await getProposedTimes(queryString.user_id, meetings.map((m) => m.id)).catch((err) => {
    //     console.log('Could not get proposed times', err);
    //     throw err;
    //   });
    //   console.log(proposedTimes);
    //   for (let meeting of meetings) {
    //     if (meeting.status === MeetingStatus.PROPOSED) {
    //       const meetingProposedTimes = proposedTimes.filter((pt) => pt.meeting_id === meeting.id);
    //       for (let proposedTime of meetingProposedTimes) {
    //         meetingsResponse.push({
    //           ...meeting,
    //           ...proposedTime
    //         });
    //       }
    //     } else {
    //       meetingsResponse.push(meeting);
    //     }
    //   }
    // } else {
    //   meetingsResponse = meetings;
    // }
    let meetingsResponse = meetings;
    //console.log(JSON.stringify(meetings));
    return common.formResponse(200, JSON.stringify(meetingsResponse));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};
