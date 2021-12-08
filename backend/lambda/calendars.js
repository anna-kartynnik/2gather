const common = require('./common.js');

const USER_CALENDARS_TABLE = 'user_calendars';


async function createCalendar(userId, calendarId) {
  const result = await common.makeQuery(new common.Query(
    `INSERT INTO ${USER_CALENDARS_TABLE} (user_id, calendar_id) VALUES ($1, $2);`,
    [userId, calendarId]
  ));

  return result;
}

async function getCalendar(userId, calendarId) {
  const result = await common.makeQuery(new common.Query(
    `SELECT * FROM ${USER_CALENDARS_TABLE} WHERE user_id=$1 AND calendar_id=$2;`,
    [userId, calendarId]
  ));
  return result.rows;
}

async function getCalendarsByUser(userId) {
  const result = await common.makeQuery(new common.Query(
    `SELECT * FROM ${USER_CALENDARS_TABLE} WHERE user_id=$1;`,
    [userId]
  ));
  return result.rows;
}


exports.createCalendar = createCalendar;
exports.getCalendar = getCalendar;
exports.getCalendarsByUser = getCalendarsByUser;