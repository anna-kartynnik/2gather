const common = require('./common.js');

const MEETINGS_TABLE = 'meetings';
const MEETING_PARTICIPANTS_TABLE = 'meeting_participants';
const USER_CALENDARS_TABLE = 'user_calendars';

class MeetingStatus {
  static CREATED = 'created';
  static PROPOSED = 'proposed';
  static CONFIRMED = 'confirmed';
}


async function createMeeting(meeting) {
  // [TODO] make a helpful method in common?
  const client = await common.getClient();
  let meetingId = null;
  await client.query('BEGIN');
  try {
    const meetingInsertResult = await client.query(
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
    );
    meetingId = meetingInsertResult.rows.length === 1 ? meetingInsertResult.rows[0].id : null;
    console.log(meetingId);
    if (meetingId === null) {
      throw new Error('Could not get id of newly generated meeting.');
    }

    // [TODO] batch insert?
    for (let participant of meeting.participants) {
      let userParamName = 'user_id';
      let userParamValue = participant;
      if (participant.startsWith('email')) {
        userParamName = 'user_email';
        userParamValue = participant.split(':')[1]
      }
      const participantInsertResult = await client.query(
        `INSERT INTO ${MEETING_PARTICIPANTS_TABLE} (meeting_id, ${userParamName})
         VALUES ($1, $2)`,
         [
           meetingId,
           userParamValue
         ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return {
    id: meetingId
  };
}

async function getMeetingsByParticipant(userId, status) {
  let queryText = `SELECT m.* FROM ${MEETINGS_TABLE} m INNER JOIN ${MEETING_PARTICIPANTS_TABLE} mp ` +
      `ON m.id = mp.meeting_id WHERE mp.user_id = $1`;
  const queryValues = [userId];
  if (status) {
    queryText += ' AND m.status = $2;';
    queryValues.push(status);
  } else {
    queryText += ';';
  }
  const result = await common.makeQuery(new common.Query(
    queryText,
    queryValues
  ));
  return result.rows;
}

async function getMeetingsByStatus(status) {
  const result = await common.makeQuery(new common.Query(
    `SELECT * FROM ${MEETINGS_TABLE} WHERE status = $1`,
    [status]
  ));
  return result.rows.length === 1 ? result.rows[0] : result.rows; 
}

async function getMeetingById(id) {
  const result = await common.makeQuery(new common.Query(
    `SELECT * FROM ${MEETINGS_TABLE} WHERE id = $1`,
    [id]
  ));
  return result.rows.length === 1 ? result.rows[0] : result.rows; 
}

async function getMeetingParticipantsWithCalendars(id) {
  const result = await common.makeQuery(new common.Query(
    `SELECT uc.* FROM ${MEETINGS_TABLE} m INNER JOIN ${MEETING_PARTICIPANTS_TABLE} mp ON m.id = mp.meeting_id
       INNER JOIN ${USER_CALENDARS_TABLE} uc ON mp.user_id = uc.user_id WHERE m.id = $1;`,
     [id]
  ));
  return result.rows;
}

// async function getMeetingsCalendars(ids) {
//   const result = await common.makeQuery(new common.Query(
//     `SELECT DISTINCT uc.* FROM ${MEETINGS_TABLE} m INNER JOIN ${MEETING_PARTICIPANTS_TABLE} mp ON m.id = mp.meeting_id
//        INNER JOIN ${USER_CALENDARS_TABLE} uc ON mp.user_id = uc.user_id WHERE m.id = ANY($1::UUID[]);`,
//      [ids]
//   ));
//   return result.rows;
// }


exports.MeetingStatus = MeetingStatus;
exports.createMeeting = createMeeting;
exports.getMeetingsByParticipant = getMeetingsByParticipant;
exports.getMeetingsByStatus = getMeetingsByStatus;
exports.getMeetingById = getMeetingById;
exports.getMeetingParticipantsWithCalendars = getMeetingParticipantsWithCalendars;
