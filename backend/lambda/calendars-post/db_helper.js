const AWS = require('aws-sdk');

const AWS_REGION = 'us-east-1';

const config = {
  region: AWS_REGION,
  credentials: AWS.config.credentials,
}

const dynamodb = new AWS.DynamoDB(config);

const CALENDARS_TABLE_NAME = '2gather-calendars';

function getCalendars(userEmail) {
  const params = {
    Key: {
      'user_email': {
        S: userEmail
      }
    }, 
    TableName: CALENDARS_TABLE_NAME
  };
  return dynamodb.getItem(params).promise();
}

async function saveUserCalendar(userEmail, calendarId) {
  const userCalendars = await getCalendars(userEmail);
  console.log(userCalendars);
  if (!userCalendars || !userCalendars.Item) {
    const params = {
      Item: {
        'user_email': {
          S: userEmail
        },
        'calendars': {
          SS: [calendarId]
        }
      },
      TableName: CALENDARS_TABLE_NAME
    };
    
    console.log('Storing to db, creating ', params);
    return dynamodb.putItem(params).promise();    
  } else {
    const params = {
      Key: {
        'user_email': {
          S: userEmail
        }
      },
      UpdateExpression: 'ADD calendars :calendar_id',

      ExpressionAttributeValues: {
        ':calendar_id': {
          SS: [calendarId]
        }
      },
      TableName: CALENDARS_TABLE_NAME
      
      // ConditionExpression: {
      //   'user_email': {
      //     'ComparisonOperator': 'attribute_exist',
      //     'AttributeValueList': [{
      //       S: userEmail
      //     }]
      //   }
      // } //conditions.Attr('Key').exists()
    };
    console.log('Storing to db, appending ', params);
    return dynamodb.updateItem(params).promise(); 
  }
}

exports.saveUserCalendar = saveUserCalendar;
