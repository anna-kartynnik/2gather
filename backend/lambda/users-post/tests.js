const { handler } = require('./index.js');

// user creation
(async () => {
  const email = `test${Math.round(Math.random() * 1000000)}@yopmail.com`;
  const response = await handler({
    body: JSON.stringify({
      email: email
    })
  });
  console.log(`creating user with email: '${email}'`);
  console.log(response);
})();

// wrong email
for (let email of ['test', 'test@yop', '']) {
  (async () => {
    const response = await handler({
      body: JSON.stringify({
        email: email
      })
    });
    console.log(`wrong email '${email}'`);
    console.log(response);
  })();
}

// no email
(async () => {
  const response = await handler({
    body: JSON.stringify({
    })
  });
  console.log('no email');
  console.log(response);
})();