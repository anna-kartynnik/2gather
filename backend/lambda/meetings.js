const common = require('./common.js');

const MEETINGS_TABLE = 'meetings';
const MEETING_PARTICIPANTS_TABLE = 'meeting_participants';
const USER_CALENDARS_TABLE = 'user_calendars';
const MEETING_PROPOSED_TIMES_TABLE = 'meeting_proposed_times';
const MEETING_PROPOSED_TIME_VOTES_TABLE = 'meeting_proposed_time_votes';
const MEETING_QUESTIONS_TABLE = 'meeting_questions';
const MEETING_QUESTION_VOTES_TABLE = 'meeting_question_votes';
const MEETING_ATTACHMENTS_TABLE = 'meeting_attachments';
const USERS_TABLE = 'users';

class MeetingStatus {
  static CREATED = 'created';
  static PROPOSED = 'proposed';
  static CONFIRMED = 'confirmed';
  static DELETED = 'deleted';
}

class MeetingSchedulingMode {
  static WITH_VOTES = 'with-votes';
  static WITHOUT_VOTES = 'without-votes';
}


async function createMeeting(meeting, oldMeeting) {
  // [TODO] make a helpful method in common?
  const client = await common.getClient();
  let meetingId = null;
  await client.query('BEGIN');
  try {
    const meetingInsertResult = await client.query(
      `INSERT INTO ${MEETINGS_TABLE} (name, description, preferred_time_start, preferred_time_end, duration, creator_id, scheduling_mode)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
      [
        meeting.name,
        meeting.description || '',
        meeting.preferred_time_start,
        meeting.preferred_time_end,
        meeting.duration,
        meeting.creator_id,
        meeting.scheduling_mode
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

    if (meeting.attachments && meeting.attachments.length > 0) {
      let attachmentsQueryText = `INSERT INTO ${MEETING_ATTACHMENTS_TABLE} (meeting_id, bucket, object_key) VALUES `;
      const attachmentsQueryValues = [meetingId];
      for (let attachment of meeting.attachments) {
        const paramIndex = attachmentsQueryValues.length + 1;
        attachmentsQueryText += `($1, $${paramIndex}, $${paramIndex + 1}),`;
        attachmentsQueryValues.push(attachment.bucket);
        attachmentsQueryValues.push(attachment.object_key);
      }

      attachmentsQueryText = attachmentsQueryText.substring(0, attachmentsQueryText.length - 1);
      attachmentsQueryText += ';';

      await client.query(attachmentsQueryText, attachmentsQueryValues);
    }

    if (oldMeeting && oldMeeting.id) {
      await client.query(`UPDATE ${MEETINGS_TABLE} SET status = '${MeetingStatus.DELETED}' WHERE id = $1;`, [oldMeeting.id]);
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

async function updateMeeting(meeting) {
  const oldParticipants = await getMeetingParticipants(meeting.id).catch((err) => {
    console.log(`Could not get participants for meeting with id ${meeting.id}`, err);
    throw err;
  });
  const oldParticipantsSet = new Set(oldParticipants.map((p) => p.id || (!p.id && `email:${p.email}`)));
  const newParticipantsSet = new Set(meeting.participants);
  const participantsToAdd = [];
  const participantsToDelete = [];

  for (let newParticipant of meeting.participants) {
    if (!oldParticipantsSet.has(newParticipant)) {
      participantsToAdd.push(newParticipant);
    }
  }
  for (let oldParticipant of oldParticipants) {
    const value = oldParticipant.id ? oldParticipant.id : `email:${oldParticipant.email}`;
    if (!newParticipantsSet.has(value)) {
      participantsToDelete.push(value);
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
    if (participantId.startsWith('email')) {
      queries.push(new common.Query(
        `INSERT INTO ${MEETING_PARTICIPANTS_TABLE} (meeting_id, user_id, user_email)
         VALUES ($1, (SELECT id FROM ${USERS_TABLE} WHERE email = $2), $2);`,
        [meeting.id, participantId.split(':')[1]]
      ));
    } else {
      queries.push(new common.Query(
        `INSERT INTO ${MEETING_PARTICIPANTS_TABLE} (meeting_id, user_id, user_email)
         VALUES ($1, $2, NULL);`,
        [meeting.id, participantId]
      ));
    }
  }
  for (let participantId of participantsToDelete) {
    if (participantId.startsWith('email')) {
      queries.push(new common.Query(
        `DELETE FROM ${MEETING_PARTICIPANTS_TABLE} WHERE meeting_id = $1 AND user_email = $2;`,
        [meeting.id, participantId.split(':')[1]]
      ));
    } else {
      queries.push(new common.Query(
        `DELETE FROM ${MEETING_PARTICIPANTS_TABLE} WHERE meeting_id = $1 AND user_id = $2;`,
        [meeting.id, participantId]
      ));
    }
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

async function getMeetingsByParticipant(userId, status) {
  let queryText = '';
  let addPar = false;
  let queryValues = [userId];

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
  const params = [];
  for(let i = 2; i <= ids.length + 1; i++) {
    params.push('$' + i);
  }
  const queryValues = [userId];
  queryValues.push(...ids);
  const result = await common.makeQuery(new common.Query(
    `SELECT mpt.meeting_id, mpt.id AS meeting_proposed_time_id, mpt.proposed_time AS proposed_time, ` +
      `COUNT(mptv.id) AS number_of_votes, ` +
      `(SELECT mptv2.id FROM ${MEETING_PROPOSED_TIME_VOTES_TABLE} mptv2 WHERE mptv2.user_id = $1 ` +
      `AND mptv2.proposed_time_id = mpt.id) AS vote_id ` +
      `FROM ${MEETING_PROPOSED_TIMES_TABLE} mpt LEFT OUTER JOIN ${MEETING_PROPOSED_TIME_VOTES_TABLE} mptv ` +
      `ON mpt.id = mptv.proposed_time_id ` +
      `WHERE mpt.meeting_id IN (${params.join(',')}) ` +
      `GROUP BY mpt.id ORDER BY mpt.proposed_time;`,
    queryValues
  ));
  return result.rows; 
}

async function getProposedTimesForMeeting(meetingId) {
  const result = await common.makeQuery(new common.Query(
    `SELECT mpt.meeting_id, mpt.id AS meeting_proposed_time_id, mpt.proposed_time AS proposed_time, ` +
      `COUNT(mptv.id) AS number_of_votes ` +
      `FROM ${MEETING_PROPOSED_TIMES_TABLE} mpt LEFT OUTER JOIN ${MEETING_PROPOSED_TIME_VOTES_TABLE} mptv ` +
      `ON mpt.id = mptv.proposed_time_id ` +
      `WHERE mpt.meeting_id = $1 ` +
      `GROUP BY mpt.id ORDER BY mpt.proposed_time;`,
    [meetingId]
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
      WHERE mp.meeting_id = $1
    UNION
    SELECT mp.user_id AS id, mp.user_email AS email FROM ${MEETING_PARTICIPANTS_TABLE} mp
      WHERE mp.meeting_id = $1 AND mp.user_id IS NULL;`,
     [id]
  ));
  return result.rows;
}

async function getMeetingAttachments(id) {
  const result = await common.makeQuery(new common.Query(
    `SELECT * FROM ${MEETING_ATTACHMENTS_TABLE} WHERE meeting_id = $1;`,
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

async function getMeetingParticipantsWithId(meetingId) {
  const result = await common.makeQuery(new common.Query(
    `SELECT mp.* FROM ${MEETING_PARTICIPANTS_TABLE} mp WHERE mp.meeting_id = $1 AND mp.user_id IS NOT NULL;`,
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
  const params = [];
  for(let i = 1; i <= userIds.length; i++) {
    params.push('$' + i);
  }
  const queryValues = [];
  queryValues.push(...userIds);

  const result = await common.makeQuery(new common.Query(
    `SELECT m.confirmed_time, m.duration FROM ${MEETINGS_TABLE} m INNER JOIN ${MEETING_PARTICIPANTS_TABLE} mp 
      ON m.id = mp.meeting_id WHERE mp.user_id IN (${params.join(',')}) AND m.status = '${MeetingStatus.CONFIRMED}';`,
     queryValues
  ));
  return result.rows;
}

async function getMeetingVotes(meetingId) {
  const result = await common.makeQuery(new common.Query(
    `SELECT MAX(mptv.created) AS last_vote_time FROM ${MEETING_PROPOSED_TIME_VOTES_TABLE} mptv INNER JOIN ${MEETING_PROPOSED_TIMES_TABLE} mpt
      ON mptv.proposed_time_id = mpt.id WHERE mpt.meeting_id = $1 GROUP BY mptv.user_id;`,
    [meetingId]
  ));
  return result.rows; 
}

async function saveMeetingTimeSuggestions(meeting, slots) {
  if (slots.length === 0) {
    return;
  }
  const queries = [];
  for (let slot of slots) {
    queries.push(new common.Query(
      `INSERT INTO ${MEETING_PROPOSED_TIMES_TABLE} (meeting_id, proposed_time) VALUES ($1, $2);`,
      [meeting.id, slot]
    ));
  }
  let updateMeetingQuery = '';
  let updateMeetingValues = [meeting.id];
  if (meeting.scheduling_mode === MeetingSchedulingMode.WITHOUT_VOTES) {
    updateMeetingQuery = `UPDATE ${MEETINGS_TABLE}
      SET status = '${MeetingStatus.CONFIRMED}',
          confirmed_time = $2
      WHERE id = $1;`
    updateMeetingValues.push(slots[0]);
  } else {
    updateMeetingQuery = `UPDATE ${MEETINGS_TABLE}
      SET status = '${MeetingStatus.PROPOSED}'
      WHERE id = $1;`
  }
  queries.push(new common.Query(
    updateMeetingQuery,
    updateMeetingValues
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

async function rescheduleMeeting(id, params) {
  const refMeeting = await getMeetingById(id);

  const newMeeting = {
    name: refMeeting.name,
    description: refMeeting.description,
    preferred_time_start: params.preferred_time_start,
    preferred_time_end: params.preferred_time_end,
    duration: params.duration,
    creator_id: refMeeting.creator_id
  };

  const participants = await getMeetingParticipants(id);
  newMeeting.participants = participants.map((p) => {
    return (p.id) ? p.id : `email:${p.email}`;
  });

  const attachments = await getMeetingAttachments(id);
  newMeeting.attachments = attachments;

  const saved = await createMeeting(newMeeting, refMeeting);
  newMeeting.id = saved.id;

  return newMeeting;
}


exports.MeetingStatus = MeetingStatus;
exports.MeetingSchedulingMode = MeetingSchedulingMode;
exports.createMeeting = createMeeting;
exports.updateMeeting = updateMeeting;
exports.confirmMeeting = confirmMeeting;
exports.deleteMeeting = deleteMeeting;
exports.getMeetingsByParticipant = getMeetingsByParticipant;
exports.getMeetingsByStatus = getMeetingsByStatus;
exports.getMeetingById = getMeetingById;
exports.getMeetingAttachments = getMeetingAttachments;
exports.getMeetingParticipants = getMeetingParticipants;
exports.getMeetingParticipantsWithoutId = getMeetingParticipantsWithoutId;
exports.getMeetingParticipantsWithId = getMeetingParticipantsWithId;
exports.getMeetingParticipantsWithCalendars = getMeetingParticipantsWithCalendars;
exports.saveMeetingTimeSuggestions = saveMeetingTimeSuggestions;
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
exports.rescheduleMeeting = rescheduleMeeting;
exports.getMeetingVotes = getMeetingVotes;
exports.getProposedTimesForMeeting = getProposedTimesForMeeting;
