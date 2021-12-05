console.log('start google_utils');

const { google } = require('googleapis');
//const calendar = google.calendar('v3');
const { GoogleAuth } = require('google-auth-library');

console.log('end google_utils');
const moment = require('moment');

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];


// // Acquire an auth client, and bind it to all future calls
// const authClient = await auth.getClient();
// google.options({auth: authClient});


async function getFreeBusy(calendars, timeRangeFrom, timeRangeTo) {
  const auth = new GoogleAuth({
    keyFile: './service-account.json',
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();
  const calendar = google.calendar({version: 'v3', auth: authClient});

  // // Acquire an auth client, and bind it to all future calls
  // const authClient = await auth.getClient();
  // google.options({auth: authClient});
  
  console.log('calendars: ' + calendars);
  
  return calendar.freebusy.query({
    requestBody: {
      items: calendars,
      timeMin: timeRangeFrom,
      timeMax: timeRangeTo
    }
  });
  // //const calendar = google.calendar({version: 'v3', auth});
  // const authClient = await auth.getClient();
  // const calendar = google.calendar({version: 'v3', auth: authClient});
  // return new Promise((resolve, reject) => {
  //   calendar.freebusy.list({
  //     calendarId: 'anna.kartynnik@gmail.com',
  //     timeMin: (new Date('2021-11-01')).toISOString(),
  //     maxResults: 10,
  //     singleEvents: true,
  //     orderBy: 'startTime',
  //   }, (err, res) => {
  //     if (err) {
  //       console.log('The API returned an error: ' + err);
  //       reject(err);
  //       return;
  //     }
  //     const events = res.data.items;
  //     if (events.length) {
  //       console.log('Upcoming 10 events:');
  //       events.map((event, i) => {
  //         const start = event.start.dateTime || event.start.date;
  //         console.log(`${start} - ${event.summary}`);
  //       });
  //     } else {
  //       console.log('No upcoming events found.');
  //     }
  //     resolve(events);
  //   });
  // });
}

async function createEvent(calendars, meeting) {
  const auth = new GoogleAuth({
    keyFile: './service-account.json',
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();
  const calendar = google.calendar({version: 'v3', auth: authClient});

  //console.log(calendar);

  console.log('calendars: ' + calendars);

  const attendees = calendars.map((c) => {
    return {email: c.email};
  });
  console.log(attendees);

  const promises = [];
  for (let calendar_obj of calendars) {
    const params = {
      calendarId: calendar_obj.calendar_id,
      requestBody: {
        //attendees: attendees, [TODO] ?
        description: meeting.description,
        start: {
          dateTime: meeting.confirmed_time
        },
        end: {
          dateTime: moment(meeting.confirmed_time).add(meeting.duration, 'minutes').toISOString()
        }
      }
    };
    console.log(params);
    promises.push(
      calendar.events.insert(params)
    );
  }
  return Promise.all(promises);
}

exports.getFreeBusy = getFreeBusy;
exports.createEvent = createEvent;

// exports.handler = async (event) => {
//   //console.log(process.env);
//   try {
//     const events = await listEvents();

//     return {
//       "statusCode": 200,
//       "body": "ok",//data,
//       "isBase64Encoded": false
//     };
//   } catch (err) {
//     return {
//       "statusCode": 400,
//       "body": 'Something went wrong',
//       "isBase64Encoded": false
//     };
//   }
// }

// listEvents().then((resp) => {
//   console.log(resp);
// }, (err) => {
//   console.log(err);
// });







