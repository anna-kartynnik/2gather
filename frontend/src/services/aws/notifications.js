import { getAPIGatewaySDK } from './sdkUtil';


export async function getNotifications(userId) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.notificationsGet({
      user_id: userId
    }, {}, {});
  });
}

export async function updateNotifications(ids) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.notificationsPut({}, {
      ids: ids
    }, {});
  });
} 
