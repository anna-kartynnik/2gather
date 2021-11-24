const common = require('./common.js');

const MEETINGS_TABLE = 'meetings';


async function createMeeting(meeting) {
  const result = await common.makeQuery(new common.Query(
    `INSERT INTO ${MEETINGS_TABLE} (name, description, preferred_time_start, preferred_time_end, duration, creator_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
    [
      meeting.name,
      meeting.description || '',
      meeting.preferred_time_start,
      meeting.preferred_time_end,
      meeting.duration,
      meeting.creator_id
    ]
  ));
  return result.rows.length === 1 ? result.rows[0] : null;
}

async function getMeetingsByCreator(creatorId) {
  const result = await common.makeQuery(new common.Query(
    `SELECT * FROM ${MEETINGS_TABLE} WHERE creator_id=$1;`,
    [creatorId]
  ));
  return result.rows;
}


exports.createMeeting = createMeeting;
exports.getMeetingsByCreator = getMeetingsByCreator;