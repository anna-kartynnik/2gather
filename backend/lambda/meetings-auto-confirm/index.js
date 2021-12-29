// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings_utils = require('./meetings.js');
const google_utils = require('./google_utils.js');
const propose_utils = require('./propose.js');
const sqs_utils =require('./sqs_utils.js');


const DEFAULT_WAIT_TIME = 60 * 1000; // in milliseconds

async function findBestTime(meeting, proposedTimesWithVotes) {
  // Check that proposed times are still available.
  const userCalendars = await meetings_utils.getMeetingParticipantsWithCalendars(
    meeting.id
  ).catch(common.handlePromiseReject('Could not get meetings calendars'));
      
  console.log(userCalendars);
  const response = await google_utils.getFreeBusy(
    userCalendars.map((item) => {
      return {id: item.calendar_id};
    }),
    meeting.preferred_time_start,
    meeting.preferred_time_end
  ).catch(common.handlePromiseReject('Could not get free-busy slots'));
  console.log(response);

  const busySlots = response.holidays.data.items.map((event) => {
    return {
      start: event.start.date,
      end: event.end.date
    };
  });

  const googleCalendars = response.freebusy.data.calendars;
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
    [-8],// in hours, so here -08:00, participantsTimeZones
    -1
  );

  proposedTimesWithVotes.sort((a, b) => {
    if (a.number_of_votes > b.number_of_votes) {
      return -1;
    } else if (a.number_of_votes < b.number_of_votes) {
      return 1;
    }
    return 0;
  });

  let bestTime = null;
  for (let proposedTime of proposedTimesWithVotes) {
    const correspondingSlot = proposedSlots.find((slot) => new Date(slot.start).getTime() === new Date(proposedTime.proposed_time).getTime());
    console.log('corresponding slot ', correspondingSlot);
    if (correspondingSlot && correspondingSlot.numberOfOverlaps === 0) {
      bestTime = proposedTime.proposed_time;
      break;
    }
  }

  return bestTime;
}

exports.handler = async (event) => {
  try {

    const meetings = await meetings_utils.getMeetingsByStatus(
      meetings_utils.MeetingStatus.PROPOSED
    ).catch(common.handlePromiseReject('Could not get meetings with status "proposed"'));

    for (let meeting of meetings) {
      if (meeting.scheduling_mode === meetings_utils.MeetingSchedulingMode.WITHOUT_VOTES) {
        continue;
      }

      const participantsWithId = await meetings_utils.getMeetingParticipantsWithId(meeting.id)
        .catch(common.handlePromiseReject(`Could not get meeting participants for meeting with id ${meeting.id}`));

      const lastVotes = await meetings_utils.getMeetingVotes(meeting.id)
        .catch(common.handlePromiseReject(`Could not get meeting last votes for meeting with id ${meeting.id}`));

      console.log(lastVotes);
      console.log(participantsWithId);

      if (lastVotes.length > 0 && lastVotes.length === participantsWithId.length) {
        let maxVoteTime = new Date(lastVotes[0]['last_vote_time']).getTime();
        for (let voteTimeRow of lastVotes) {
          const voteTime = new Date(voteTimeRow['last_vote_time']).getTime();
          if (voteTime > maxVoteTime) {
            maxVoteTime = voteTime;
          }
        }
        if (new Date().getTime() - maxVoteTime > DEFAULT_WAIT_TIME) {
          // All the participants have voted, auto confirm this meeting.
          const proposedTimesWithVotes = await meetings_utils.getProposedTimesForMeeting(meeting.id)
            .catch(common.handlePromiseReject(`Could not get proposed times`));

          console.log(proposedTimesWithVotes);

          proposedTimesWithVotes.sort((a, b) => {
            if (a.number_of_votes > b.number_of_votes) {
              return -1;
            } else if (a.number_of_votes < b.number_of_votes) {
              return 1;
            }
            return 0;
          });

          const bestTime = await findBestTime(meeting, proposedTimesWithVotes)
            .catch(common.handlePromiseReject('Could not get best time'));
          console.log('best time ', bestTime);

          if (!bestTime) {
            console.log('Something went wrong, we could not get best time. Race condition?');
            continue;
          }

          const confirmResult = await meetings_utils.confirmMeeting({ meeting_id: meeting.id, confirmed_time: bestTime })
            .catch(common.handlePromiseReject(`Could not save a meeting as confirmed`));

          // create queue message in 'confirmed' queue.
          const sqsResp = await sqs_utils.sendMessage(meeting).catch((err) => {
            console.log('Could not send a message to the queue', err);
            throw err;
          });

          console.log(sqsResp);
        }
      }
    }

  } catch (err) {
    console.log('Error: ' + err);
  }
};