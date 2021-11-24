const common = require('./common.js');

const USERS_TABLE = 'users';

async function getUserByEmail(email) {
  const result = await common.makeQuery(new common.Query(
    `SELECT id FROM ${USERS_TABLE} WHERE email=$1;`,
    [email]
  ));
  return result.rows.length === 1 ? result.rows[0] : null;
}

async function createUser(user) {
  const result = await common.makeQuery(new common.Query(
    `INSERT INTO ${USERS_TABLE} (email) VALUES ($1) RETURNING id;`,
    [user.email]
  ));
  return result.rows.length === 1 ? result.rows[0] : null;
}

exports.getUserByEmail = getUserByEmail;
exports.createUser = createUser;