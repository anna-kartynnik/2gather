// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings_utils = require('./meetings.js');
const sqs_utils = require('./sqs_utils.js');
const ses_utils = require('./ses_utils.js');
const google_utils = require('./google_utils.js');
const notif_utils = require('./notifications.js');


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

      if (meeting.status !== meetings_utils.MeetingStatus.CONFIRMED) {
        console.log(`Message with id ${meetingId} has status different from CONFIRMED`);
        await deleteSQSMessage(messageReceiptHandle);
        continue;
      }

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
      const notifResponse = await notif_utils.createNotifications(
        calendars.map((c) => c.user_id),
        meeting.id,
        `Meeting ${meeting.name} has been confirmed`
      ).catch(common.handlePromiseReject('Could not save notifications'));

      // send email to users without id
      const participantsWithoutId = await meetings_utils.getMeetingParticipantsWithoutId(meeting.id)
        .catch(common.handlePromiseReject(`Could not get meeting participants for meeting with id ${meeting.id}`));

      console.log(participantsWithoutId);
      if (participantsWithoutId.length > 0) {
        const sesResponse = await ses_utils.sendEmail(participantsWithoutId.map((p) => p.user_email), meeting)
          .catch(common.handlePromiseReject(`Could not send email`));
        console.log(sesResponse);
      }

      // delete from queue.
      await deleteSQSMessage(messageReceiptHandle);
    }

  } catch (err) {
    console.log('Error: ' + err);
  }
};