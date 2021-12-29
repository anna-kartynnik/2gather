import { getAPIGatewaySDK } from './sdkUtil';

import moment from 'moment';


export const ATTACHMENTS_BUCKET_NAME = '2gather-meeting-attachments';

export class MeetingStatus {
  static CREATED = 'created';
  static PROPOSED = 'proposed';
  static CONFIRMED = 'confirmed';
  static DELETED = 'deleted';
}

function getNote(meetingFromDB) {
  if (meetingFromDB.status === MeetingStatus.CREATED) {
    return 'We are looking for the best time slots for your meeting...';
  } else if (meetingFromDB.status === MeetingStatus.PROPOSED) {
    return `Proposed time: ${moment(meetingFromDB.proposed_time).format('h:mma')}`;
  } else if (meetingFromDB.status === MeetingStatus.CONFIRMED) {
    const timeToMeeting = moment(meetingFromDB.confirmed_time).diff(moment(), 'minutes');
    if (timeToMeeting < 60) {
      return `Starts in ${timeToMeeting} minutes`;
    } else {
      return `Starts at ${moment(meetingFromDB.confirmed_time).format('h:mma')}`;
    }
  }
}

function getPills(meetingFromDB) {
  const pills = [];
  if (meetingFromDB.duration <= 30) {
    pills.push({
      text: `quick: ${meetingFromDB.duration} min`,
      color: 'success'
    });
  } else {
    const durationStr = meetingFromDB.duration < 60 ?
      `${meetingFromDB.duration} min` :
      `${meetingFromDB.duration / 60} h`;
    pills.push({
      text: `long: ${durationStr}`,
      color: 'warning'
    });    
  }
  return pills;
}

function expandMeeting(meetingFromDB, userId, meetingsMap) {
  const expanded = {
    ...meetingFromDB,
    note: getNote(meetingFromDB),
    pills: getPills(meetingFromDB),
    is_confirmed: meetingFromDB.status === MeetingStatus.CONFIRMED,
    is_creator: meetingFromDB.creator_id === userId
  };
  if (expanded.status === MeetingStatus.PROPOSED) {
    meetingsMap[expanded.id].sort((a, b) => {
      return moment(a.proposed_time).isBefore(b.proposed_time) ? -1 : 1;
    });
    for (let index = 0; index < meetingsMap[expanded.id].length; index++) {
      const proposition = meetingsMap[expanded.id][index];
      if (proposition.meeting_proposed_time_id === expanded.meeting_proposed_time_id) {
        expanded.proposed_option_number = index + 1;
        break;
      }
    }
    expanded.proposed_options_total = meetingsMap[expanded.id].length;
    expanded.proposed_option_accepted = true; // TODO
  }

  return expanded;
}

function getTimeForSort(meeting) {
  let time = meeting.preferred_time_start;
  if (meeting.status === MeetingStatus.PROPOSED) {
    time = meeting.proposed_time;
  } else if (meeting.status === MeetingStatus.CONFIRMED) {
    time = meeting.confirmed_time;
  }
  return time;
}

export function getAgendaList(user, status) {
  const params = {
    user_id: user.id
  };
  if (status) {
    params.status = status;
  }
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsGet(params).then((resp) => {
      const meetingsMap = {};
      for (let meeting of resp.data) {
        if (!meetingsMap[meeting.id]) {
          meetingsMap[meeting.id] = [];
        }
        meetingsMap[meeting.id].push(meeting);
      }
      const meetings = resp.data.map((meeting) => {
        const m = expandMeeting(meeting, user.id, meetingsMap);
        m.proposed_times = meetingsMap[meeting.id];
        return m;
      });
      console.log(meetings);
      meetings.sort((a, b) => {
        return moment(getTimeForSort(a)).isBefore(getTimeForSort(b)) ? -1 : 1;
      });
      console.log(meetings);
      return meetings;
    });
  });
}

function getParticipantsForBackend(participants) {
  const participantsToSave = participants.map((p) => {
    if (p.label === p.value) {
      // kostyl for email-only participant
      return `email:${p.value}`;
    } else {
      return p.value;
    }
  });
  return participantsToSave;
}

export async function createMeeting(meeting) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsPost({}, {
      name: meeting.name,
      description: meeting.description,
      creator_id: meeting.creatorId,
      participants: getParticipantsForBackend(meeting.participants),
      preferred_time_start: meeting.preferredTimeStart,
      preferred_time_end: meeting.preferredTimeEnd,
      duration: meeting.duration,
      attachments: meeting.attachments,
      scheduling_mode: meeting.schedulingMode
    });
  });
}

export function updateMeeting(meeting) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsIdPut({
      id: meeting.id,
    }, {
      id: meeting.id,
      name: meeting.name,
      description: meeting.description,
      status: meeting.status,
      confirmed_time: meeting.confirmed_time,
      participants: getParticipantsForBackend(meeting.participants),
    });
  });
}

export function confirmMeeting(meeting) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsIdConfirmPost({
      id: meeting.id,
    }, {
      id: meeting.id,
      confirmed_time: meeting.confirmed_time,
    });
  });
}


export function getConfirmedAgendaList(user) {
  return getAgendaList(user, MeetingStatus.CONFIRMED);
}

export function getPendingAgendaList(userId) {
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     return resolve(LIST_ITEMS);
  //   }, 1000);
  // });
  const params = {
    user_id: userId,
    status: MeetingStatus.PROPOSED
  };

  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsGet(params).then((resp) => {
      const meetingsMap = {};
      for (let meeting of resp.data) {
        if (!meetingsMap[meeting.id]) {
          meetingsMap[meeting.id] = [];
        }
        meetingsMap[meeting.id].push(meeting);
      }
      const meetings = [];
      for (let meetingId of Object.keys(meetingsMap)) {
        const meeting = meetingsMap[meetingId][0];
        meeting.proposed_times = meetingsMap[meetingId];
        meetings.push(meeting);
      }
      // resp.data.map((meeting) => {
      //   meeting.proposed_times = meetingsMap[meeting.id];
      //   return meeting;
      // });
      return meetings;
    });
  });
}

export function getParticipants(id) {
  // [TODO] get participants that user usually use.
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     return resolve([{
  //       id: '1',
  //       email: 'test1@gmail.com'
  //     }, {
  //       id: '2',
  //       email: 'test2@gmail.com'
  //     }, {
  //       id: '3',
  //       email: 'test3@gmail.com'
  //     }])
  //   }, 1000);
  // });
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.participantsGet({
      creator_id: id,
    });
  }); 
}

export async function saveMeetingTimeVote(proposedTimeId, userId, voteId) {
  return getAPIGatewaySDK().then((sdk) => {
    const func = voteId === null ? sdk.meetingsProposedTimeIdVotesPost : sdk.meetingsProposedTimeIdVotesDelete;
    return func({
      id: proposedTimeId,
      //user_id: userId
    }, {
      user_id: userId
    });
  });
}

export function getMeetingById(id, userId) {
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     const items = LIST_ITEMS.filter((item) => item.id === id);
  //     return resolve(items.length > 0 ? items[0] : null);
  //   }, 1000);
  // }); 
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsIdGet({
      id: id,
      user_id: userId
    });
  }); 
}

export function deleteMeeting(id) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsIdDelete({
      id: id,
    });
  });
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     return resolve();
  //   }, 1000);
  // });  
}

export function getQuestions(meetingId, userId) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsIdQuestionsGet({
      id: meetingId,
      user_id: userId
    });
  });
}

export function addQuestion(params) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsIdQuestionsPost(params, params);
  });
}

export function deleteQuestion(meetingId, questionId) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsIdQuestionsDelete({
      id: meetingId,
      question_id: questionId
    });
  });
}

export async function saveQuestionVote(meetingId, questionId, userId, voteId) {
  return getAPIGatewaySDK().then((sdk) => {
    if (voteId === null) {
      return sdk.meetingsIdQuestionIdVotesPost({
        id: meetingId,
        question_id: questionId
      }, {
        id: meetingId,
        question_id: questionId,
        user_id: userId
      });
    } else {
      return sdk.meetingsIdQuestionIdVotesDelete({
        id: meetingId,
        question_id: questionId,
        vote_id: voteId
      }, {
        id: meetingId,
        question_id: questionId,
        vote_id: voteId,
        user_id: userId
      });
    }
  });
}

export async function uploadAttachmentPut(attachment, attachmentKey) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.uploadPut(
      {
        'Content-Type': attachment.type,
        'x-amz-meta-filename': attachmentKey,
      },
      attachment,
      {}
    );
  });
}

export async function rescheduleMeeting(meeting) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsIdReschedulePost({
      id: meeting.id
    }, {
      id: meeting.id,
      preferred_time_start: meeting.preferredTimeStart,
      preferred_time_end: meeting.preferredTimeEnd,
      duration: meeting.duration
    });
  });
}






