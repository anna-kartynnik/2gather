// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings_utils = require('./meetings.js');
const google_utils = require('./google_utils.js');
const propose_utils = require('./propose.js');
const sqs_utils =require('./sqs_utils.js');

const moment = require('moment');

const CONFIRMED_QUEUE_URL = process.env.CONFIRMED_QUEUE_URL;


async function deleteSQSMessage(messageReceiptHandle) {
  const deleteResponse = await sqs_utils.deleteMessage(messageReceiptHandle).catch((err) => {
    console.log('Could not delete SQS message', err);
  });
  return deleteResponse;
}

exports.handler = async (event) => {
  try {

    const sqsMessageResponse = await sqs_utils.receiveMessage().catch((err) => {
      console.log('Could not get message from the queue', err);
      throw err;
    });

    console.log(sqsMessageResponse);

    if (!sqsMessageResponse['Messages'] || sqsMessageResponse['Messages'].length === 0) {
      console.log('No messages');
      return;
    }

    for (let sqsMessage of sqsMessageResponse['Messages']) {

      const messageAttributes = sqsMessage['MessageAttributes'];
      console.log(messageAttributes);

      const meetingId = messageAttributes['meetingId']['StringValue'];
      const messageReceiptHandle = sqsMessage['ReceiptHandle'];

      const meeting = await meetings_utils.getMeetingById(meetingId).catch((err) => {
        console.log(`Could not get meeting with id: ${meetingId}`, err);
        throw err;
      });

      console.log(meeting);

      if (meeting.status !== meetings_utils.MeetingStatus.CREATED) {
        console.log(`Message with id ${meetingId} has status different from CREATED`);
        await deleteSQSMessage(messageReceiptHandle);
        continue;
      }

      const userCalendars = await meetings_utils.getMeetingParticipantsWithCalendars(
        meeting.id
      ).catch((err) => {
        console.log('Could not get meetings calendars', err);
        throw err;
      });
      console.log(userCalendars);
      const response = await google_utils.getFreeBusy(
        userCalendars.map((item) => {
          return {id: item.calendar_id};
        }),
        meeting.preferred_time_start,
        meeting.preferred_time_end
      ).catch((err) => {
        console.log('Could not get free-busy slots', err);
        throw err;
      });
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

      // Should be obsolete since google calendars should have all the meetings now.
      const additionalBusySlots = await meetings_utils.getParticipantsBusySlots(userCalendars.map((u) => u.user_id)).catch((err) => {
        console.log('Could not get participants busy slots', err);
        throw err;
      });

      busySlots.push(...additionalBusySlots.map((bs) => {
        const confirmedTime = moment(bs.confirmed_time).utc().milliseconds(0);
        return {
          start: bs.confirmed_time,
          end: moment(confirmedTime).add(bs.duration, 'minutes')
        };
      }));
      console.log(busySlots);

      const proposedSlotObjects = propose_utils.getProposedSlots(
        busySlots,
        meeting.preferred_time_start,
        meeting.preferred_time_end,
        meeting.duration,
        [-8]// in hours, so here -08:00, participantsTimeZones
      );

      const proposedSlots = proposedSlotObjects.map((slot) => moment(slot.start).utc().toISOString());
      console.log(proposedSlots);

      // save proposed slots and change meeting status to 'proposed'
      const saveResult = await meetings_utils.saveMeetingTimeSuggestions(meeting, proposedSlots);
      console.log(saveResult);

      if (meeting.scheduling_mode === meetings_utils.MeetingSchedulingMode.WITHOUT_VOTES) {
        const sqsResponse = await sqs_utils.sendMessage(meeting, CONFIRMED_QUEUE_URL)
          .catch(common.handlePromiseReject('Could not send message to confirmed queue'));
      }

      await deleteSQSMessage(messageReceiptHandle);

    }
  } catch (err) {
    console.log('Error: ' + err);
  }
};