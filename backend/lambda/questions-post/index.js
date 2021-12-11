// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings = require('./meetings.js');


function validate(params) {
  let message = '';
  let isValid = true;
  if (!params.text) {
    isValid = false;
    message = 'Question text is required';
  } else if (!params.userId) {
    isValid = false;
    message = 'User id is required';
  }

  return {
    isValid,
    message
  };
}

exports.handler = async (event) => {
  try {
    console.log(event);
    const meetingId = event.pathParameters.id;

    if (!meetingId) {
      return common.formResponse(400, JSON.stringify({
        message: 'Meeting identificator is required'
      }));
    }

    const requestBody = JSON.parse(event.body);
    const params = {
      userId: requestBody.user_id,
      text: requestBody.text,
      meetingId: meetingId
    };

    // validate data
    const validation = validate(params);
    if (!validation.isValid) {
      return common.formResponse(400, JSON.stringify({
        message: validation.message
      }));
    }

    const meetingQuestionResponse = await meetings.addQuestion(params).catch(
      common.handlePromiseReject('Could not save a meeting question')
    );
    const response = meetingQuestionResponse;

    console.log(JSON.stringify(response));
    return common.formResponse(201, JSON.stringify(response));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};

