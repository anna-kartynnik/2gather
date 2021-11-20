import AWS from 'aws-sdk';


const AWS_REGION = 'us-east-1'; // [TODO] from config file?
const AWS_COGNITO_IDENTITY_POOL_ID = 'us-east-1:e5ac55f8-ca54-475c-8cf1-cd10c5d14408'; // [TODO] from config file?
const AWS_COGNITO_GOOGLE_LOGIN_PARAM = 'accounts.google.com';


//let AWS_API_GATEWAY_SDK = null;

// export function getAPIGatewaySDK() {
//   if (window.AWS_API_GATEWAY_SDK === null) {
//     window.AWS_API_GATEWAY_SDK = window.apigClientFactory.newClient({
//       //accessKey: AWS.config.credentials.accessKeyId,
//       //secretKey: AWS.config.credentials.secretAccessKey,
//       //sessionToken: AWS.config.credentials.sessionToken,
//       //region: AWS_REGION
//     });
//   }

//   return window.AWS_API_GATEWAY_SDK;
// }

// export function clearAPIGatewaySDK() {
//   window.AWS_API_GATEWAY_SDK = null;
// }

export function loginToAWS(googleAuthResponse) {
  // Initialize the Amazon Cognito credentials provider
  AWS.config.region = AWS_REGION;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: AWS_COGNITO_IDENTITY_POOL_ID,
    Logins: {
      [AWS_COGNITO_GOOGLE_LOGIN_PARAM]: googleAuthResponse['id_token'],
    },
  });

  // Obtain AWS credentials
  return AWS.config.credentials.getPromise(); //(() => {
    // // Access AWS resources here.
    // let creds = {
    //       accessKey: AWS.config.credentials.accessKeyId,
    //       secretKey: AWS.config.credentials.secretAccessKey,
    //       sessionToken: AWS.config.credentials.sessionToken
    //     };
    //     let googleData = {
    //       awsCreds : creds,
    //       googleProfile : profile
    //     };
    //     callback.googleCallback(creds,profile);
    //   });
    
  //});

}

export function refreshAWSToken(newGoogleToken) {
  AWS.config.credentials.params.Logins[AWS_COGNITO_GOOGLE_LOGIN_PARAM] = newGoogleToken;
}

// const awsAPIGatewaySDK = window.apigClientFactory.newClient({});