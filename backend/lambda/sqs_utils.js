
const QUEUE_URL = process.env.QUEUE_URL;

const AWS = require('aws-sdk');

const config = {
  region: 'us-east-1',
  credentials: AWS.config.credentials,
};

const DEFAULT_NUMBER_OF_MESSAGES = 5;

// Create an SQS service object
const sqs = new AWS.SQS(config);

function sendMessage(meeting, queueUrl) {
  if (!queueUrl) {
    queueUrl = QUEUE_URL;
  }
  const params = {
    DelaySeconds: 10,
    MessageAttributes: {
      meetingId: {
        DataType: 'String',
        StringValue: meeting.id
      }
    },
    MessageBody: 'empty',
    QueueUrl: queueUrl
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
