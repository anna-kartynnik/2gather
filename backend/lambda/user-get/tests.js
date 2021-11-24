const { handler } = require('./index.js');

(async () => {
  const email = 'test@yopmail.com';
  const response = await exports.handler({
    queryStringParameters: {
      email: email
    }
  });
  console.log(`should be successful for '${email}'`);
  console.log(response);
})();