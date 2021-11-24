const { handler } = require('./index.js');


(async () => {
  const response = await handler({
    queryStringParameters: {
      creator_id: '0251d031-675a-e646-7121-8df12a70216a'
    }
  });
  console.log('successful response');
  console.log(response);
})();