import { getToken, deleteToken } from './../utils/tokenUtils';

const axios = require('axios');

const GOOGLE_API_SERVICE_ACCOUNT_EMAIL = 'service-account@gather-331905.iam.gserviceaccount.com';


async function handleRequest(axiosPromise) {
  const token = getToken();
  try {
    return await axiosPromise(token);
  } catch (err) {
    console.log(err);
    console.log(err.message);
    if (err.message.indexOf('401') > -1) {
      // We need to resign in.
      deleteToken();
      window.location.reload();
    } else {
      throw err;
    }
  }
}

export async function getUserProfile() {
  return await handleRequest((token) =>
    axios({
      method: 'get',
      url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`
    })
  );
}

export async function getUserCalendarList() {
  return await handleRequest((token) =>
    axios({
      method: 'get',
      url: `https://www.googleapis.com/calendar/v3/users/me/calendarList?alt=json&access_token=${token}&minAccessRole=owner`
    })
  );
}

export async function givePermissionsToCalendar(calendarId) {
  // [TODO] ask user for an appropriate permission role?
  return await handleRequest((token) =>
    axios({
      method: 'post',
      url: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/acl?access_token=${token}`,
      data: {
        role: 'writer', //'freeBusyReader',
        scope: {
          type: 'user',
          value: GOOGLE_API_SERVICE_ACCOUNT_EMAIL
        }
      }
    }).then((resp) => {
      // save to our db
      console.log('saving to db');
      return testAsync();
    })
  );
}

async function testAsync() {
  return new Promise((resolve, reject) => {
    resolve('ok');
  });
}
