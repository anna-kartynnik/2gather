import { getAPIGatewaySDK } from './sdkUtil';

// const axios = require('axios');

// const BASE_AWS_URL = 'https://teu4z70109.execute-api.us-east-1.amazonaws.com/dev';

// async function handleRequest(axiosPromise) {
//   const token = getToken();
//   try {
//     return await axiosPromise(token);
//   } catch (err) {
//     console.log(err);
//     console.log(err.message);
//     if (err.message.indexOf('401') > -1) {
//       // We need to resign in.
//       deleteToken();
//       window.location.reload();
//     } else {
//       throw err;
//     }
//   }
// }

export async function saveCalendar(userId, calendarId) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.calendarsPost({}, {
      user_id: userId,
      calendar_id: calendarId
    }, {});
  });
}

export async function getCalendarList(userId) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.calendarsGet({
      user_id: userId
    }, {}, {});
  });
} 