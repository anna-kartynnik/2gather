// common.js should be put near index.js when deploying.
const common = require('./common.js');
const { getMeetingById, getMeetingParticipants, getProposedTimes, MeetingStatus, getMeetingAttachments } = require('./meetings.js');


const AWS = require('aws-sdk');

const config = {
  region: 'us-east-1',
  credentials: AWS.config.credentials,
};

const s3 = new AWS.S3(config);

function generateURL({ bucket, object_key, expires }) {
  const signedUrl = s3.getSignedUrl('getObject', {
    Key: object_key,
    Bucket: bucket,
    Expires: expires || 900,
  });
  
  console.log(signedUrl);

  return signedUrl;
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

    const queryString = event.queryStringParameters;

    if (!queryString.user_id) {
      return common.formResponse(400, JSON.stringify({
        message: '`user_id` parameter is required'
      }));
    }

    const meeting = await getMeetingById(meetingId).catch((err) => {
      console.log(`Could not get meeting by id ${meetingId}`, err);
      throw err;
    });
    const participants = await getMeetingParticipants(meetingId).catch((err) => {
      console.log(`Could not get meeting participants for meeting with id ${meetingId}`, err);
      throw err;
    });
    meeting.participants = participants;

    if (meeting.status === MeetingStatus.PROPOSED) {
      const proposedTimes = await getProposedTimes(queryString.user_id, [meetingId])
        .catch(common.handlePromiseReject('Could not get proposed times'));
      meeting.proposed_times = proposedTimes;
    }

    const attachments = await getMeetingAttachments(meetingId).catch((err) => {
      console.log(`Could not get meeting attachments for meeting with id ${meetingId}`, err);
      throw err;
    });
    meeting.attachments = attachments.map((attachment) => {
      const attachmentWithUrl = {...attachment};
      attachmentWithUrl.url = generateURL(attachment);
      return attachmentWithUrl;
    });

    //console.log(JSON.stringify(meetings));
    return common.formResponse(200, JSON.stringify(meeting));
  } catch (err) {
    console.log('Error: ' + err);
    return common.formResponse(500, JSON.stringify({
      message: err && err.message ? err.message : 'An error has occurred.'
    }));
  }
};
