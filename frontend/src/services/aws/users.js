import { getAPIGatewaySDK } from './sdkUtil';

export async function getUser(userEmail) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.usersGet({
      email: userEmail
    });
  });
}

export async function createUser(userEmail) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.usersPost({}, {
      email: userEmail
    });
  });
}