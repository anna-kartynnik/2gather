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


export function getAgendaList(userId) {
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     return resolve(LIST_ITEMS);
  //   }, 2000);
  // });
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsGet({
      user_id: userId
    }).then((resp) => {
      const meetings = resp.data.map((meeting) => {
        return {
          ...meeting,
          note: 'todo note',
          pills: [],
          is_confirmed: meeting.status === 'confirmed',
          is_creator: meeting.creator_id === userId
        }
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

  // if (!body.name) {
  //   isValid = false;
  //   message = 'Name is required';
  // } else if (!body.creator_id) {
  //   isValid = false;
  //   message = 'Creator id is required';
  // } else if (!body.preferred_time_start) {
  //   isValid = false;
  //   message = 'Preferred time range (from) is required';
  // } else if (!body.preferred_time_end) {
  //   isValid = false;
  //   message = 'Preferred time range (to) is required';
  // } else if (!body.duration) {


export function getConfirmedAgendaList() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve(LIST_ITEMS.filter((item) => item.is_confirmed === true));
    }, 1000);
  });
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






