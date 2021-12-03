import { getAPIGatewaySDK } from './sdkUtil';

import moment from 'moment';

const LIST_ITEMS = [{
  id: 'id1',
  name: 'Stand-up meeting',
  description: 'Description 1',
  participants: [],
  time: moment().format('YYYY-MM-DD[T]HH:mm'),
  note: 'Starts in 15 min',
  pills: [{
    text: 'quick: 15 min',
    color: 'success'
  }],
  is_confirmed: true,
  // [TODO] remove next property
  is_creator: true
}, {
  id: 'id2',
  name: 'Discussion Group',
  description: 'Description 2',
  participants: [],
  note: 'Proposed time: 4pm',
  pills: [{
    text: 'long: 1 hour',
    color: 'warning'
  }],
  is_confirmed: false,
  proposed_option_number: 1,
  proposed_options_total: 2,
  proposed_option_accepted: true
}, {
  id: 'id2',
  name: 'Discussion Group',
  description: 'Description 2',
  participants: [],
  note: 'Proposed time: 5pm',
  pills: [{
    text: 'long: 1 hour',
    color: 'warning'
  }],
  is_confirmed: false,
  proposed_option_number: 2,
  proposed_options_total: 2,
  proposed_option_accepted: false
}];

class MeetingStatus {
  static CREATED = 'created';
  static PROPOSED = 'proposed';
  static CONFIRMED = 'confirmed';
}

function getNote(meetingFromDB) {
  if (meetingFromDB.status === MeetingStatus.CREATED) {
    return 'We are looking for the best time slots for your meeting...';
  } else if (meetingFromDB.status === MeetingStatus.PROPOSED) {
    return `Proposed time: ${moment(meetingFromDB.proposed_time).format('ha')}`;
  } else if (meetingFromDB.status === MeetingStatus.CONFIRMED) {
    const timeToMeeting = moment().diff(moment(meetingFromDB.time), 'minutes');
    if (timeToMeeting < 60) {
      return `Starts in ${timeToMeeting} minutes`;
    } else {
      return `Starts at ${moment(meetingFromDB.time).format('ha')}`;
    }
  }
}

function getPills(meetingFromDB) {
  const pills = [];
  if (meetingFromDB.duration < 30) {
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
      color: 'success'
    });    
  }
  return pills;
}

function expandMeeting(meetingFromDB, userId) {
  return {
    ...meetingFromDB,
    note: getNote(meetingFromDB),
    pills: getPills(meetingFromDB),
    is_confirmed: meetingFromDB.status === MeetingStatus.CONFIRMED,
    is_creator: meetingFromDB.creator_id === userId
  };
}

export function getAgendaList(userId, status) {
  const params = {
    user_id: userId
  };
  if (status) {
    params.status = status;
  }
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsGet(params).then((resp) => {
      const meetings = resp.data.map((meeting) => {
        return expandMeeting(meeting, userId);
      });
      return meetings;
    });
  });
}

export async function createMeeting(meeting) {
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsPost({}, {
      name: meeting.name,
      description: meeting.description,
      creator_id: meeting.creatorId,
      participants: meeting.participants,
      preferred_time_start: meeting.preferredTimeStart,
      preferred_time_end: meeting.preferredTimeEnd,
      duration: meeting.duration
    });
  });
}

export function getConfirmedAgendaList(userId) {
  return getAgendaList(userId, MeetingStatus.CONFIRMED);
}

export function getParticipants() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve([{
        id: '1',
        email: 'test1@gmail.com'
      }, {
        id: '2',
        email: 'test2@gmail.com'
      }, {
        id: '3',
        email: 'test3@gmail.com'
      }])
    }, 1000);
  });
}

export function getMeetingById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const items = LIST_ITEMS.filter((item) => item.id === id);
      return resolve(items.length > 0 ? items[0] : null);
    }, 1000);
  });  
}






