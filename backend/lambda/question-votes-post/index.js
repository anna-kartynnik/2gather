// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings = require('./meetings.js');


function validate(params) {
  let message = '';
  let isValid = true;
  if (!params.question_id) {
    isValid = false;
    message = 'Question id is required';
  } else if (!params.user_id) {
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
    const requestBody = JSON.parse(event.body);
    const params = {
      question_id: requestBody.question_id,
      user_id: requestBody.user_id
    };

    // validate data
    const validation = validate(params);
    if (!validation.isValid) {
      return common.formResponse(400, JSON.stringify({
        message: validation.message
      }));
    }

    const voteResponse = await meetings.createQuestionVote(params).catch(
      common.handlePromiseReject('Could not save a meeting vote')
    );
    const response = voteResponse;

    console.log(JSON.stringify(response));
    return common.formResponse(201, JSON.stringify(response));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};

