const common = require('./common.js');

const NOTIFICATIONS_TABLE = 'notifications';


async function createNotifications(userIds, meetingId, text) {
  let queries = [];
  for (let userId of userIds) {
    queries.push(new common.Query(
      `INSERT INTO ${NOTIFICATIONS_TABLE} (user_id, meeting_id, text)
       VALUES ($1, $2, $3);`,
      [userId, meetingId, text]
    ));
  }

  if (queries.length === 0) {
    return;
  }

  let result = null;
  const client = await common.getClient();
  try {
    result = await common.makeQueries(client, queries);
  } finally {
    client.release();
  }
  return result;
}

async function getUserNotifications(userId) {
  const result = await common.makeQuery(new common.Query(
    `SELECT * FROM ${NOTIFICATIONS_TABLE} WHERE user_id=$1 AND seen IS NULL;`,
    [userId]
  ));
  return result.rows;
}

async function updateNotifications(ids) {
  let queries = [];
  for (let notifId of ids) {
    queries.push(new common.Query(
      `UPDATE ${NOTIFICATIONS_TABLE}
        SET seen = NOW()
        WHERE id = $1;`,
      [notifId]
    ));
  }

  if (queries.length === 0) {
    return;
  }

  let result = null;
  const client = await common.getClient();
  try {
    result = await common.makeQueries(client, queries);
  } finally {
    client.release();
  }
  return result;
}


exports.createNotifications = createNotifications;
exports.getUserNotifications = getUserNotifications;
exports.updateNotifications = updateNotifications;
