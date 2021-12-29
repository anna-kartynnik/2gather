
const AWS = require('aws-sdk');

const config = {
  region: 'us-east-1',
  credentials: AWS.config.credentials,
};

const moment = require('moment');

const EMAIL_SENDER = 'notifications@twogather.info';
const CHARSET = 'UTF-8';
const EMAIL_SUBJECT = 'A new meeting has been created';

function getHtmlEmail(meeting) {
  return `
<html>
  <head>
  </head>
  <body>
    <p>New meeting has been created</p>
    <br/>
    <div>
      Meeting starts at ${moment(meeting.confirmed_time).format('MMM, D h:mma')}.
      Details can be found <a href="${meeting.id}">here</a>.
      If you want to have such a meeting created in your calendar, just sign up in the <a href="https://twogather.info">2gather application</a>!
    </div>
    <br/>
    <p>Have a nice day!<p>
  </body>
</html>
  `;
}

function getText(meeting) {
  return `
    A new meeting has been created. See details below.
  `;
}


function sendEmail(participants, meeting) {
  // Create sendEmail params 
  var params = {
    Destination: {
      ToAddresses: participants
    },
    Message: {
      Body: {
        Html: {
          Charset: CHARSET,
          Data: getHtmlEmail(meeting)
        },
        Text: {
          Charset: CHARSET,
          Data: getText(meeting)
        }
      },
      Subject: {
        Charset: CHARSET,
        Data: EMAIL_SUBJECT
      }
    },
    Source: EMAIL_SENDER,
    ReplyToAddresses: [
      EMAIL_SENDER
    ],
  };

  // Create the promise and SES service object
  return new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
}

exports.sendEmail = sendEmail;
