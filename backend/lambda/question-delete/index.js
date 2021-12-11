// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings = require('./meetings.js');


function validate(params) {
  let message = '';
  let isValid = true;
  if (!params.question_id) {
    isValid = false;
    message = 'Question id is required';
  }
  if (!params.id) {
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

    // validate data
    const validation = validate(event.pathParameters);
    if (!validation.isValid) {
      return common.formResponse(400, JSON.stringify({
        message: validation.message
      }));
    }

    const meetingQuestionResponse = await meetings.deleteQuestion(event.pathParameters.question_id)
      .catch(common.handlePromiseReject('Could not save a meeting vote'));
    const response = meetingQuestionResponse;

    console.log(JSON.stringify(response));
    return common.formResponse(204, JSON.stringify(response));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};

