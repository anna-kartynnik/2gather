
const QUEUE_URL = process.env.QUEUE_URL;

const AWS = require('aws-sdk');

const config = {
  region: 'us-east-1',
  credentials: AWS.config.credentials,
};

const DEFAULT_NUMBER_OF_MESSAGES = 5;

// Create an SQS service object
const sqs = new AWS.SQS(config);

function sendMessage(meeting/*, calendars*/) {
  const params = {
    DelaySeconds: 10,
    MessageAttributes: {
      meetingId: {
        DataType: 'String',
        StringValue: meeting.id
      }//,
      // participants: {
      //   DataType: 'String',
      //   StringValue: meeting.participants.join(',')
      // },
      // preferredTimeStart: {
      //   DataType: 'String',
      //   StringValue: meeting.preferred_time_start
      // },
      // preferredTimeEnd: {
      //   DataType: 'String',
      //   StringValue: meeting.preferred_time_end
      // },
      // duration: {
      //   DataType: 'String',
      //   StringValue: '' + meeting.duration
      // },
      // calendars: {
      //   DataType: 'String',
      //   StringValue: calendars.join(',')
      // }
    },
    MessageBody: 'empty',
    QueueUrl: QUEUE_URL
  };
    
  return sqs.sendMessage(params).promise();
}

function receiveMessage() {
  return sqs.receiveMessage({
    MaxNumberOfMessages: DEFAULT_NUMBER_OF_MESSAGES,
    MessageAttributeNames: [
      'All'
    ],
    QueueUrl: QUEUE_URL
  }).promise();
}

function deleteMessage(messageReceiptHandle) {
  return sqs.deleteMessage({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: messageReceiptHandle
  }).promise();
}

exports.sendMessage = sendMessage;
exports.receiveMessage = receiveMessage;
exports.deleteMessage = deleteMessage;