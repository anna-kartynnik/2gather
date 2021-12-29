const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const moment = require('moment');

const US_HOLIDAYS_CALENDAR = 'en.usa#holiday@group.v.calendar.google.com';
const INCLUDE_HOLIDAYS_IN_BUSY = true;

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

async function getFreeBusy(calendars, timeRangeFrom, timeRangeTo) {
  const auth = new GoogleAuth({
    keyFile: './service-account.json',
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();
  const calendar = google.calendar({version: 'v3', auth: authClient});
  
  console.log('calendars: ' + calendars);
  
  let freeBusyResponse = null;
  return calendar.freebusy.query({
    requestBody: {
      items: calendars,
      timeMin: timeRangeFrom,
      timeMax: timeRangeTo
    }
  }).then((resp) => {
    freeBusyResponse = resp;
    return calendar.events.list({
      calendarId: US_HOLIDAYS_CALENDAR,
      timeMin: timeRangeFrom,
      timeZone: 'UTC',
      maxResults: 10
    });
  }).then((resp) => {
    return Promise.resolve({
      freebusy: freeBusyResponse,
      holidays: resp
    });
  });
}

async function createEvent(calendars, meeting) {
  const auth = new GoogleAuth({
    keyFile: './service-account.json',
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();
  const calendar = google.calendar({version: 'v3', auth: authClient});

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
        //attendees: attendees,
        summary: meeting.name,
        description: `${meeting.description || 'Meeting created by 2gather'}`,
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

