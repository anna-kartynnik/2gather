const { handler } = require('./index.js');


(async () => {
  const response = await handler({
    queryStringParameters: {
      user_id: '30c2062d-f6aa-142f-4161-1daf4730d15a'
    }
  });
  console.log('successful response');
  console.log(response);
})();