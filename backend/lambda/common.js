const pg = require('pg');
const pool = new pg.Pool(
  // {
  //   user: process.env.PGUSER,
  //   host: process.env.PGHOST,
  //   database: process.env.PGDATABASE,
  //   password: process.env.PGPASSWORD,
  //   port: process.env.PGPORT
  // }  
);

class Query {
  constructor(text, values, isCommittable) {
    this.text = text;
    this.values = values;
    this.isCommittable = isCommittable ?
      isCommittable :
      text.toLowerCase().trim().startsWith('insert') ||
        text.toLowerCase().trim().startsWith('update') ||
        text.toLowerCase().trim().startsWith('delete');
  }
}

async function makeQueries(client, queries) {
  let res = [];
  await client.query('BEGIN');
  try {
    for (let query of queries) {
      console.log('DEBUG: ', query.text);
      res.push(await client.query(query.text, query.values));
    }
    await client.query('COMMIT');
  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK');
    throw err;
  }

  return res;
}

function getClient() {
  return pool.connect();
}

async function makeQuery(query) {
  console.log('DEBUG: Creating client...');
  const client = await getClient();
  console.log('DEBUG: Client created');
  let res = null;
  const shouldBeCommitted = query.isCommittable;
  console.log(`DEBUG: committable ${shouldBeCommitted}`)
  try {
    if (shouldBeCommitted) {
      const results = await makeQueries(client, [query]);
      res = results[0];
    } else {
      res = await client.query(query.text, query.values);
    }
  } finally {
    client.release();
  }
  return res;
}

function formResponse(statusCode, bodyJSON) {
  return {
    statusCode: statusCode,
    body: bodyJSON,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    isBase64Encoded: false,   
  };
}

function isEmailValid(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

exports.makeQuery = makeQuery;
exports.formResponse = formResponse;
exports.Query = Query;
exports.isEmailValid = isEmailValid;
exports.getClient = getClient;

