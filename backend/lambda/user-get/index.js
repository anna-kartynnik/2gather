// users.js and common.js should be put near index.js when deploying.
const common = require('./common.js');
const users = require('./users.js');


exports.handler = async (event) => {
  try {
    console.log(event);
    const queryString = event.queryStringParameters;

    const user = await users.getUserByEmail(queryString.email);
    console.log(user);
    if (user === null) {
      return common.formResponse(400, JSON.stringify({
        message: 'User not found'
      }));
    } else {
      return common.formResponse(200, JSON.stringify(user));
    }
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};

