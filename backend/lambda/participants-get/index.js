// common.js should be put near index.js when deploying.
const common = require('./common.js');
const { getAllCommonParticipants } = require('./meetings.js');


exports.handler = async (event) => {
  try {
    console.log(event);
    const queryString = event.queryStringParameters;

    if (!queryString.creator_id) {
      return common.formResponse(400, JSON.stringify({
        message: '`creator_id` parameter is required'
      }));
    }

    const creatorId = queryString.creator_id;

    const participants = await getAllCommonParticipants(creatorId).catch((err) => {
      console.log(`Could not get all common participants by creator id ${creatorId}`, err);
      throw err;
    });
    console.log(JSON.stringify(participants));
    return common.formResponse(200, JSON.stringify(participants));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};
