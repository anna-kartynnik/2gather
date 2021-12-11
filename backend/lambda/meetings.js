const common = require('./common.js');

const MEETINGS_TABLE = 'meetings';
const MEETING_PARTICIPANTS_TABLE = 'meeting_participants';
const USER_CALENDARS_TABLE = 'user_calendars';
const MEETING_PROPOSED_TIMES_TABLE = 'meeting_proposed_times';
const MEETING_PROPOSED_TIME_VOTES_TABLE = 'meeting_proposed_time_votes';
const MEETING_QUESTIONS_TABLE = 'meeting_questions';
const MEETING_QUESTION_VOTES_TABLE = 'meeting_question_votes';
const USERS_TABLE = 'users';

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

    let participantsQueryText = `INSERT INTO ${MEETING_PARTICIPANTS_TABLE} (meeting_id, user_id, user_email) VALUES `;
    const participantsQueryValues = [meetingId];
    for (let participant of meeting.participants) {
      let userParamName = 'user_id';
      let userParamValue = participant;
      if (participant.startsWith('email')) {
        const userEmail = participant.split(':')[1];
        const paramIndex = participantsQueryValues.length + 1;
        participantsQueryText += `($1, (SELECT id FROM ${USERS_TABLE} WHERE email = $${paramIndex}), $${paramIndex}),`;
        participantsQueryValues.push(userEmail);
      } else {
        const paramIndex = participantsQueryValues.length + 1;
        participantsQueryText += ` ($1, $${paramIndex}, NULL),`;
        participantsQueryValues.push(participant);
      }
    }
    participantsQueryText = participantsQueryText.substring(0, participantsQueryText.length - 1);
    participantsQueryText += ';';

    await client.query(participantsQueryText, participantsQueryValues);

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

async function updateMeeting(meeting) {
  const oldParticipants = await getMeetingParticipants(meeting.id).catch((err) => {
    console.log(`Could not get participants for meeting with id ${meeting.id}`, err);
    throw err;
  });
  const oldParticipantsSet = new Set(oldParticipants.map((p) => p.id));
  const newParticipantsSet = new Set(meeting.participants);
  const participantsToAdd = [];
  const participantsToDelete = [];
  // [TODO] handle users without id but with email!
  for (let newParticipant of meeting.participants) {
    if (!oldParticipantsSet.has(newParticipant)) {
      participantsToAdd.push(newParticipant);
    }
  }
  for (let oldParticipant of oldParticipants) {
    if (!newParticipantsSet.has(oldParticipant.id)) {
      participantsToDelete.push(oldParticipant.id);
    }
  }
  const queries = [];
  queries.push(new common.Query(
    `UPDATE ${MEETINGS_TABLE} 
     SET name = $2,
         description = $3,
         status = $4,
         confirmed_time = $5
     WHERE id = $1;`,
    [meeting.id, meeting.name, meeting.description, meeting.status, meeting.confirmed_time]
  ));
  for (let participantId of participantsToAdd) {
    queries.push(new common.Query(
      `INSERT INTO ${MEETING_PARTICIPANTS_TABLE} (meeting_id, user_id)
       VALUES ($1, $2);`,
      [meeting.id, participantId]
    ));
  }
  for (let participantId of participantsToDelete) {
    queries.push(new common.Query(
      `DELETE FROM ${MEETING_PARTICIPANTS_TABLE} WHERE meeting_id = $1 AND user_id = $2;`,
      [meeting.id, participantId]
    ));
  }

  const client = await common.getClient();
  let result = null;
  try {
    result = await common.makeQueries(client, queries);
  } finally {
    client.release();
  }
  return result; 
}

async function confirmMeeting(params) {
  const result = await common.makeQuery(new common.Query(
    `UPDATE ${MEETINGS_TABLE}
       SET status = '${MeetingStatus.CONFIRMED}',
           confirmed_time = $1
       WHERE id = $2;`,
    [params.confirmed_time, params.meeting_id]
  ));
  return result; 
}

async function deleteMeeting(meetingId) {
  const result = await common.makeQuery(new common.Query(
    `DELETE FROM ${MEETINGS_TABLE} WHERE id = $1;`,
    [meetingId]
  ));
  return result;
}




// (SELECT m.*, mpt.id AS meeting_proposed_time_id, mpt.proposed_time AS proposed_time,
// COUNT(mptv.id) AS number_of_votes,
// (SELECT mptv2.id FROM meeting_proposed_time_votes mptv2 WHERE mptv2.user_id = 'dd3f4560-9a5b-39d0-b0c0-ba55f07de8e3' AND mptv2.proposed_time_id = mpt.id) AS abc
// FROM meetings m INNER JOIN meeting_participants mp ON mp.meeting_id = m.id 
// LEFT OUTER JOIN meeting_proposed_times mpt ON mpt.meeting_id = m.id
// LEFT OUTER JOIN meeting_proposed_time_votes mptv ON mptv.proposed_time_id = mpt.id
// WHERE mp.user_id = 'dd3f4560-9a5b-39d0-b0c0-ba55f07de8e3' AND m.status = 'proposed'
// AND m.preferred_time_start > NOW()
// GROUP BY m.id, mpt.id ORDER BY mpt.proposed_time NULLS FIRST)
// UNION
// (SELECT m.*, NULL AS meeting_proposed_time_id, NULL AS proposed_time,
// 0 AS number_of_votes,
// NULL AS abc
// FROM meetings m INNER JOIN meeting_participants mp ON mp.meeting_id = m.id 
// WHERE mp.user_id = 'dd3f4560-9a5b-39d0-b0c0-ba55f07de8e3' AND m.status = 'confirmed'
// AND m.preferred_time_start > NOW()
// ORDER BY m.confirmed_time);

async function getMeetingsByParticipant(userId, status) {
  let queryText = '';
  let addPar = false;
  let queryValues = [userId];
  // queryText += `SELECT m.* FROM ${MEETINGS_TABLE} m INNER JOIN ${MEETING_PARTICIPANTS_TABLE} mp ` +
  //     `ON m.id = mp.meeting_id ` +
  //     `WHERE mp.user_id = $1`;

  // if (status) {
  //   queryText += ` AND m.status = $2`;
  //   queryValues.push(status);
  // }

  // queryText += ` AND m.preferred_time_start > NOW();`;


  if (!status || status === MeetingStatus.PROPOSED) {
    queryText += `SELECT m.*, mpt.id AS meeting_proposed_time_id, mpt.proposed_time AS proposed_time, ` +
      `COUNT(mptv.id) AS number_of_votes, ` +
      `(SELECT mptv2.id FROM ${MEETING_PROPOSED_TIME_VOTES_TABLE} mptv2 WHERE mptv2.user_id = $1 ` +
      `AND mptv2.proposed_time_id = mpt.id) AS vote_id ` +
      `FROM ${MEETINGS_TABLE} m INNER JOIN ${MEETING_PARTICIPANTS_TABLE} mp ON m.id = mp.meeting_id ` +
      `LEFT OUTER JOIN ${MEETING_PROPOSED_TIMES_TABLE} mpt ON mpt.meeting_id = m.id ` +
      `LEFT OUTER JOIN ${MEETING_PROPOSED_TIME_VOTES_TABLE} mptv ON mpt.id = mptv.proposed_time_id ` +
      `WHERE mp.user_id = $1 AND m.status = '${MeetingStatus.PROPOSED}' AND m.preferred_time_start > NOW() ` +
      `GROUP BY m.id, mpt.id ORDER BY mpt.proposed_time NULLS FIRST`;
  }
  if (queryText.length > 0 && (!status || status !== MeetingStatus.PROPOSED)) {
    queryText = '(' + queryText + ') UNION (';
    addPar = true;
  }
  if (!status || status === MeetingStatus.CONFIRMED || status === MeetingStatus.CREATED) {
    queryText += `SELECT m.*, NULL AS meeting_proposed_time_id, NULL AS proposed_time, ` +
      `0 AS number_of_votes, NULL AS vote_id ` +
      `FROM ${MEETINGS_TABLE} m INNER JOIN ${MEETING_PARTICIPANTS_TABLE} mp ON m.id = mp.meeting_id ` +
      `WHERE mp.user_id = $1 `;
    if (!status || status === MeetingStatus.CONFIRMED) {
      queryText += `AND m.status = '${MeetingStatus.CONFIRMED}' AND m.confirmed_time > NOW() ` +
        `ORDER BY m.confirmed_time`;
    } else if (status === MeetingStatus.CREATED) {
      queryText += `AND m.status = '${MeetingStatus.CREATED}' AND m.preferred_time_start > NOW() ` +
        `ORDER BY m.preferred_time_start`;
    // } else {
    //   queryText += `AND m.status != '${MeetingStatus.PROPOSED}' AND m.preferred_time_start > NOW() ` +
    //     `ORDER BY m.preferred_time_start)`;
    // }
    }
  }
  if (addPar) {
    queryText += ')';
  }

  const result = await common.makeQuery(new common.Query(
    queryText,
    queryValues
  ));
  return result.rows;
}

async function getProposedTimes(userId, ids) {
  console.log(ids);
  const params = [];
  for(let i = 2; i <= ids.length + 1; i++) {
    params.push('$' + i);
  }
  const queryValues = [userId];
  queryValues.push(...ids);
  console.log(params);
  const result = await common.makeQuery(new common.Query(
    `SELECT mpt.meeting_id, mpt.id AS meeting_proposed_time_id, mpt.proposed_time AS proposed_time, ` +
      `COUNT(mptv.id) AS number_of_votes, ` +
      `(SELECT mptv2.id FROM ${MEETING_PROPOSED_TIME_VOTES_TABLE} mptv2 WHERE mptv2.user_id = $1 ` +
      `AND mptv2.proposed_time_id = mpt.id) AS vote_id ` +
      `FROM ${MEETING_PROPOSED_TIMES_TABLE} mpt LEFT OUTER JOIN ${MEETING_PROPOSED_TIME_VOTES_TABLE} mptv ` +
      `ON mpt.id = mptv.proposed_time_id ` +
      `WHERE mpt.meeting_id IN (${params.join(',')}) ` +
      `GROUP BY mpt.id;`,
    queryValues
  ));
  return result.rows; 
}

async function getMeetingsByStatus(status) {
  const result = await common.makeQuery(new common.Query(
    `SELECT * FROM ${MEETINGS_TABLE} WHERE status = $1`,
    [status]
  ));
  return result.rows; 
}

async function getMeetingById(id) {
  const result = await common.makeQuery(new common.Query(
    `SELECT * FROM ${MEETINGS_TABLE} WHERE id = $1`,
    [id]
  ));
  return result.rows.length === 1 ? result.rows[0] : null; 
}

async function getMeetingParticipants(id) {
  const result = await common.makeQuery(new common.Query(
    `SELECT u.* FROM ${USERS_TABLE} u INNER JOIN ${MEETING_PARTICIPANTS_TABLE} mp ON u.id = mp.user_id
       WHERE mp.meeting_id = $1;`,
     [id]
  ));
  return result.rows;
}

async function getMeetingParticipantsWithoutId(meetingId) {
  const result = await common.makeQuery(new common.Query(
    `SELECT mp.* FROM ${MEETING_PARTICIPANTS_TABLE} mp WHERE mp.meeting_id = $1 AND mp.user_id IS NULL;`,
     [meetingId]
  ));
  return result.rows;
}

async function getMeetingParticipantsWithCalendars(id) {
  const result = await common.makeQuery(new common.Query(
    `SELECT u.*, uc.* FROM ${MEETINGS_TABLE} m INNER JOIN ${MEETING_PARTICIPANTS_TABLE} mp ON m.id = mp.meeting_id
       INNER JOIN ${USER_CALENDARS_TABLE} uc ON mp.user_id = uc.user_id 
       INNER JOIN ${USERS_TABLE} u ON u.id = mp.user_id 
       WHERE m.id = $1;`,
     [id]
  ));
  return result.rows;
}

async function getParticipantsBusySlots(userIds) {
  console.log(userIds);
  const params = [];
  for(let i = 1; i <= userIds.length; i++) {
    params.push('$' + i);
  }
  const queryValues = [];
  queryValues.push(...userIds);
  console.log(params);

  const result = await common.makeQuery(new common.Query(
    `SELECT m.confirmed_time, m.duration FROM ${MEETINGS_TABLE} m INNER JOIN ${MEETING_PARTICIPANTS_TABLE} mp 
      ON m.id = mp.meeting_id WHERE mp.user_id IN (${params.join(',')}) AND m.status = '${MeetingStatus.CONFIRMED}';`,
     queryValues
  ));
  return result.rows;
}

async function saveMeetingTimeSuggestion(meetingId, slots) {
  if (slots.length === 0) {
    return;
  }
  const queries = [];
  for (let slot of slots) {
    queries.push(new common.Query(
      `INSERT INTO ${MEETING_PROPOSED_TIMES_TABLE} (meeting_id, proposed_time) VALUES ($1, $2);`,
      [meetingId, slot]
    ));
  }
  queries.push(new common.Query(
    `UPDATE ${MEETINGS_TABLE}
       SET status = '${MeetingStatus.PROPOSED}'
       WHERE id = $1;`,
    [meetingId]
  ));
  let result = null;
  const client = await common.getClient();
  try {
    result = await common.makeQueries(client, queries);
  } finally {
    client.release();
  }
  return result;
}

async function createMeetingVote(params) {
  const { proposed_time_id, user_id } = params;
  const result = await common.makeQuery(new common.Query(
    `INSERT INTO ${MEETING_PROPOSED_TIME_VOTES_TABLE} (proposed_time_id, user_id) VALUES ($1, $2);`,
    [proposed_time_id, user_id]
  ));
  return result.rows.length === 1 ? result.rows[0] : result.rows; 
}

async function deleteMeetingVote(params) {
  const { proposed_time_id, user_id } = params;
  const result = await common.makeQuery(new common.Query(
    `DELETE FROM ${MEETING_PROPOSED_TIME_VOTES_TABLE} WHERE proposed_time_id = $1 AND user_id = $2;`,
    [proposed_time_id, user_id]
  ));
  return result; 
}

async function getAllCommonParticipants(creatorId) {
  // Be careful, it returns data from meeting_participants, not users table!
  const result = await common.makeQuery(new common.Query(
    `SELECT DISTINCT mp.user_id AS id, mp.user_email AS email FROM ${MEETING_PARTICIPANTS_TABLE} mp WHERE mp.meeting_id IN 
      (SELECT m.id FROM ${MEETINGS_TABLE} m WHERE m.creator_id = $1);`,
    [creatorId]
  ));
  return result.rows; 
}

async function getMeetingQuestions(userId, meetingId) {
  const result = await common.makeQuery(new common.Query(
    `SELECT mq.*, COUNT(mqv.id) AS number_of_votes, 
      (SELECT mqv2.id FROM ${MEETING_QUESTION_VOTES_TABLE} mqv2 WHERE mqv2.user_id = $1 AND mqv2.question_id = mq.id) AS vote_id
      FROM ${MEETING_QUESTIONS_TABLE} mq LEFT OUTER JOIN ${MEETING_QUESTION_VOTES_TABLE} mqv
      ON mqv.question_id = mq.id WHERE mq.meeting_id = $2 GROUP BY mq.id ORDER BY number_of_votes DESC;`,
    [userId, meetingId]
  ));
  return result.rows;
}

async function addQuestion(params) {
  const { meetingId, userId, text } = params;
  const result = await common.makeQuery(new common.Query(
    `INSERT INTO ${MEETING_QUESTIONS_TABLE} (question_text, creator_id, meeting_id) VALUES ($1, $2, $3);`,
    [text, userId, meetingId]
  ));
  return result.rows.length === 1 ? result.rows[0] : result.rows;
}

async function deleteQuestion(questionId) {
  const result = await common.makeQuery(new common.Query(
    `DELETE FROM ${MEETING_QUESTIONS_TABLE} WHERE id = $1;`,
    [questionId]
  ));
  return result;
}

async function createQuestionVote(params) {
  const { question_id, user_id } = params;
  const result = await common.makeQuery(new common.Query(
    `INSERT INTO ${MEETING_QUESTION_VOTES_TABLE} (question_id, user_id) VALUES ($1, $2);`,
    [question_id, user_id]
  ));
  return result.rows.length === 1 ? result.rows[0] : result.rows;
}

async function deleteQuestionVote(params) {
  const { vote_id } = params;
  const result = await common.makeQuery(new common.Query(
    `DELETE FROM ${MEETING_QUESTION_VOTES_TABLE} WHERE id = $1;`,
    [vote_id]
  ));
  return result;
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
exports.updateMeeting = updateMeeting;
exports.confirmMeeting = confirmMeeting;
exports.deleteMeeting = deleteMeeting;
exports.getMeetingsByParticipant = getMeetingsByParticipant;
exports.getMeetingsByStatus = getMeetingsByStatus;
exports.getMeetingById = getMeetingById;
exports.getMeetingParticipants = getMeetingParticipants;
exports.getMeetingParticipantsWithoutId = getMeetingParticipantsWithoutId;
exports.getMeetingParticipantsWithCalendars = getMeetingParticipantsWithCalendars;
exports.saveMeetingTimeSuggestion = saveMeetingTimeSuggestion;
exports.createMeetingVote = createMeetingVote;
exports.deleteMeetingVote = deleteMeetingVote;
exports.getProposedTimes = getProposedTimes;
exports.getParticipantsBusySlots = getParticipantsBusySlots;
exports.getAllCommonParticipants = getAllCommonParticipants;
exports.getMeetingQuestions = getMeetingQuestions;
exports.addQuestion = addQuestion;
exports.deleteQuestion = deleteQuestion;
exports.createQuestionVote = createQuestionVote;
exports.deleteQuestionVote = deleteQuestionVote;
