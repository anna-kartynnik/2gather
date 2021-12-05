// common.js should be put near index.js when deploying.
const common = require('./common.js');
const meetings = require('./meetings.js');


function validate(params) {
  let message = '';
  let isValid = true;
  if (!params.proposed_time_id) {
    isValid = false;
    message = 'Proposed time is required';
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
      user_id: requestBody.user_id
    };
    params.proposed_time_id = event.pathParameters.id;

    // validate data
    const validation = validate(params);
    if (!validation.isValid) {
      return common.formResponse(400, JSON.stringify({
        message: validation.message
      }));
    }

    const meetingVoteResponse = await meetings.deleteMeetingVote(params).catch((err) => {
      console.log('Could not save a meeting vote', err);
      throw err;
    });
    const response = meetingVoteResponse;

    console.log(JSON.stringify(response));
    return common.formResponse(201, JSON.stringify(response));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};

