// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings_utils = require('./meetings.js');
const google_utils = require('./google_utils.js');
const propose_utils = require('./propose.js');


exports.handler = async (event) => {
  try {

    const meetings = await meetings_utils.getMeetingsByStatus(meetings_utils.MeetingStatus.CREATED).catch((err) => {
      console.log('Could not get meetings with status created', err);
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
      const response = await google_utils.getFreeBusy(
        calendars.map((item) => {
          return {id: item.calendar_id};
        }),
        meeting.preferred_time_start,
        meeting.preferred_time_end
      ).catch((err) => {
        console.log('Could not get free-busy slots', err);
        throw err;
      });
      console.log(response);
      const googleCalendars = response.data.calendars;
      
      const busySlots = [];
      for (let calendar_id of Object.keys(googleCalendars)) {
        console.log(googleCalendars[calendar_id]);
        if (googleCalendars[calendar_id].errors) {
          console.log(`Could not find calendar ${calendar_id}`, googleCalendars[calendar_id].errors[0].reason);
          continue;
        }
        busySlots.push(...googleCalendars[calendar_id].busy);
      }
      
      const proposedSlots = propose_utils.getProposedSlots(
        busySlots,
        meeting.preferred_time_start,
        meeting.preferred_time_end,
        meeting.duration,
        [8]// in hours, so here +08:00, participantsTimeZones [TODO] !!!
      );
      
      // save proposed slots and change meeting status to 'proposed'
      const saveResult = await meetings_utils.saveMeetingTimeSuggestion(meeting.id, proposedSlots);
      console.log(saveResult);
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