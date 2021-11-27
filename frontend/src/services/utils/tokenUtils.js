import { refreshAWSToken } from './../aws/login';

export const refreshTokenSetup = (resp, setToken/*, refreshAWSToken*/) => {
  // Timing to renew access token
  let refreshTiming = (resp.tokenObj.expires_in || 3600 - 5 * 60) * 1000;

  const refreshToken = async () => {
    const newAuthResp = await resp.reloadAuthResponse();
    refreshTiming = (newAuthResp.expires_in || 3600 - 5 * 60) * 1000;
    console.log('newAuthResp:', newAuthResp);
    setToken(newAuthResp.access_token);
    console.log('new auth Token', newAuthResp.id_token);
    refreshAWSToken(newAuthResp.id_token);

    // Setup the other timer after the first one
    setTimeout(refreshToken, refreshTiming);
  };

  // Setup the first refresh timer
  setTimeout(refreshToken, refreshTiming);
};

const TOKEN_NAME = '2gather-token';

export function getTokenObject() {
  const tokenString = localStorage.getItem(TOKEN_NAME);
  const userToken = JSON.parse(tokenString);
  console.log(userToken);
  return userToken;
}

export function getToken() {
  const userToken = getTokenObject();
  return userToken?.access_token;
}

export function saveToken(userToken) {
  localStorage.setItem(TOKEN_NAME, JSON.stringify(userToken));
};

export function deleteToken() {
  localStorage.removeItem(TOKEN_NAME);
}

export function getIdToken() {
  const userToken = getTokenObject();
  return userToken?.id_token;
}