import AWS from 'aws-sdk';

import { getIdToken } from './../utils/tokenUtils';
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
      console.log('no AWS_API_GATEWAY_SDK');
      if (!AWS.config.credentials) {
        console.log('no AWS credentials');
        const idToken = getIdToken();
        if (!idToken) {
          console.log('no google token id');
          reject();
        }
        return loginToAWS({ id_token: idToken })
          .then(initAPIGatewaySDK)
          .then(() => {
            console.log('ok after init, resolve');
            resolve(AWS_API_GATEWAY_SDK);
          });
      } else {
        console.log('AWS credentials ok, init and resolve');
        initAPIGatewaySDK();
        resolve(AWS_API_GATEWAY_SDK);
      }
    } else {
      console.log('AWS_API_GATEWAY_SDK ok');
      resolve(AWS_API_GATEWAY_SDK);
    }
  });
}

export function clearAPIGatewaySDK() {
  console.log('clearAPIGatewaySDK');
  AWS_API_GATEWAY_SDK = null;
}