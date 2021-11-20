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

export async function saveCalendar(userEmail, calendarId) {
  getAPIGatewaySDK().then((sdk) => {
    return sdk.calendarsPost({}, {
      user_email: userEmail,
      calendar_id: calendarId
    }, {});
  });
}