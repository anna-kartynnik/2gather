// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings = require('./meetings.js');


function validate(body) {
  let message = '';
  let isValid = true;
  if (!body.name) {
    isValid = false;
    message = 'Name is required';
  } else if (!body.participants || body.participants.length === 0) {
    isValid = false;
    message = 'Participants are required';
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

    const meetingResponse = await meetings.updateMeeting(requestBody).catch((err) => {
      console.log('Could not update the meeting', err);
      throw err;
    });

    return common.formResponse(200, JSON.stringify(requestBody));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};

