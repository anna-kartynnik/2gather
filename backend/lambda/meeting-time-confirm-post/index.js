// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings = require('./meetings.js');


function validate(body) {
  let message = '';
  let isValid = true;
  if (!body.confirmed_time) {
    isValid = false;
    message = 'Confirmed time is required';
  } else if (!body.meeting_id) {
    isValid = false;
    message = 'Meeting id is required';
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
    const params = {
      confirmed_time: requestBody.confirmed_time
    };
    params.meeting_id = event.pathParameters.id;

    // validate data
    const validation = validate(params);
    if (!validation.isValid) {
      return common.formResponse(400, JSON.stringify({
        message: validation.message
      }));
    }

    const meetingResponse = await meetings.confirmMeeting(params).catch((err) => {
      console.log('Could not confirm the meeting', err);
      throw err;
    });

    return common.formResponse(200, JSON.stringify({id: params.meeting_id}));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};

