// common.js should be put near index.js when deploying.
const common = require('./common.js');
const users = require('./users.js');


function validate(body) {
  if (!body.email) {
    return {
      isValid: false,
      message: 'Email is required'
    };
  } else if (!common.isEmailValid(body.email)) {
    return {
      isValid: false,
      message: 'Invalid email'
    };
  }
  return {
    isValid: true,
    message: ''
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

    const user = await users.createUser(requestBody);
    return common.formResponse(201, JSON.stringify(user));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};
