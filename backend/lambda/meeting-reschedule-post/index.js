// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings = require('./meetings.js');
const sqs_utils = require('./sqs_utils.js');


function validate(body) {
  let message = '';
  let isValid = true;
  if (!body.preferred_time_start) {
    isValid = false;
    message = 'Preferred time range (from) is required';
  } else if (!body.preferred_time_end) {
    isValid = false;
    message = 'Preferred time range (to) is required';
  } else if (!body.duration) {
    isValid = false;
    message = 'Duration is required';
  } else if (Number.isNaN(parseInt(body.duration, 10))) {
    isValid = false;
    message = 'Duration should be integer';
  } else {
    const durationInt = parseInt(body.duration, 10);
    if (durationInt < 10 || durationInt > 10 * 60) {
      // Do we need upper bound?
      isValid = false;
      message = 'Invalid duration value';
    }
    const preferredTimeStart = new Date(body.preferred_time_start);
    const preferredTimeEnd = new Date(body.preferred_time_end);
    if (Number.isNaN(preferredTimeStart.getTime())) {
      isValid = false;
      message = 'Preferred time (from): invalid date';
    } else if (Number.isNaN(preferredTimeEnd.getTime())) {
      isValid = false;
      message = 'Preferred time (to): invalid date';
    } else if (preferredTimeStart.getTime() >= preferredTimeEnd.getTime()) {
      isValid = false;
      message = 'Invalid preferred time range: start should be before end';
    } else if (preferredTimeStart.getTime() < new Date().getTime()) {
      isValid = false;
      message = 'Invalid preferred time range: should be in the future';
    }
  }

  return {
    isValid,
    message
  };
}

exports.handler = async (event) => {
  try {
    console.log(event);
    const requestBody = JSON.parse(event.body);

    // validate data
    const validation = validate(requestBody);
    if (!validation.isValid) {
      return common.formResponse(400, JSON.stringify({
        message: validation.message
      }));
    }

    const meetingId = event.pathParameters.id;

    if (!meetingId) {
      return common.formResponse(400, JSON.stringify({
        message: 'Meeting identificator is required'
      }));
    }

    const newMeeting = await meetings.rescheduleMeeting(meetingId, requestBody).catch((err) => {
      console.log('Could not reschedule meeting', err);
      throw err;
    });

    console.log(JSON.stringify(newMeeting));

    const sqsResp = await sqs_utils.sendMessage(newMeeting).catch((err) => {
      console.log('Could not send a message to the queue', err);
      throw err;
    });

    console.log(sqsResp);

    return common.formResponse(201, JSON.stringify(newMeeting));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};

