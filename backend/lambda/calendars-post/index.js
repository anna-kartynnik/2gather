const db_helper = require('./db_helper.js');


function getResponse(statusCode, bodyJSON) {
  return {
    statusCode: statusCode,
    body: bodyJSON,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },    
  };
}

exports.handler = async (event) => {
  try {
    console.log(event);
    const reqBody = JSON.parse(event.body);
    
    await db_helper.saveUserCalendar(reqBody.user_email, reqBody.calendar_id);
    console.log('saved');
    return getResponse(201, JSON.stringify('Created'));
  } catch (err) {
    console.log(err?.message ?? err);
    return getResponse(400, JSON.stringify({
      message: err?.message ?? 'An error has occurred.'
    }));
  }
};