import AWS from 'aws-sdk';

import { getIdToken } from './../../utils/tokenUtils';
import { loginToAWS } from './login';


const AWS_REGION = 'us-east-1'; // [TODO] from config file?


let AWS_API_GATEWAY_SDK = null;

function initAPIGatewaySDK() {
  AWS_API_GATEWAY_SDK = window.apigClientFactory.newClient({
    accessKey: AWS.config.credentials.accessKeyId,
    secretKey: AWS.config.credentials.secretAccessKey,
    sessionToken: AWS.config.credentials.sessionToken,
    region: AWS_REGION
  });  
}

export function getAPIGatewaySDK() {
  return new Promise((resolve, reject) => {
    if (AWS_API_GATEWAY_SDK === null) {
      if (!AWS.config.credentials) {
        const idToken = getIdToken();
        if (!idToken) {
          reject();
        }
        loginToAWS({ id_token: idToken })
          .then(initAPIGatewaySDK)
          .then(() => {
            resolve(AWS_API_GATEWAY_SDK);
          });
      } else {
        initAPIGatewaySDK();
        resolve(AWS_API_GATEWAY_SDK);
      }
    } else {
      resolve(AWS_API_GATEWAY_SDK);
    }
  });
}

export function clearAPIGatewaySDK() {
  AWS_API_GATEWAY_SDK = null;
}