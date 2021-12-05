import { getAPIGatewaySDK } from './sdkUtil';

import moment from 'moment';

// const LIST_ITEMS = [{
//   id: 'id1',
//   name: 'Stand-up meeting',
//   description: 'Description 1',
//   participants: [],
//   time: moment().format('YYYY-MM-DD[T]HH:mm'),
//   note: 'Starts in 15 min',
//   pills: [{
//     text: 'quick: 15 min',
//     color: 'success'
//   }],
//   is_confirmed: true,
//   // [TODO] remove next property
//   is_creator: true,
//   creator_id: 'bb222faf-a07b-065a-b158-cf2c15277963',
//   proposed_times: []
// }, {
//   id: 'id2',
//   name: 'Discussion Group',
//   description: 'Description 2',
//   participants: [],
//   note: 'Proposed time: 4pm',
//   pills: [{
//     text: 'long: 1 hour',
//     color: 'warning'
//   }],
//   is_confirmed: false,
//   proposed_times: [
//     {
//       id: 'id1',
//       proposed_time: {
//         start: moment().format('YYYY-MM-DD[T]HH:mm'),
//         end: moment().add(1, 'hour').format('YYYY-MM-DD[T]HH:mm')
//       },
//       number_of_votes: 1
//     }, {
//       id: 'id2',
//       proposed_time: {
//         start: moment('2021-12-03').format('YYYY-MM-DD[T]HH:mm'),
//         end: moment('2021-12-03').add(1, 'hour').format('YYYY-MM-DD[T]HH:mm')
//       },
//       number_of_votes: 3
//     }, {
//       id: 'id3',
//       proposed_time: {
//         start: moment('2021-12-04').format('YYYY-MM-DD[T]HH:mm'),
//         end: moment('2021-12-04').add(1, 'hour').format('YYYY-MM-DD[T]HH:mm')
//       },
//       number_of_votes: 10
//     }
//   ],
//   proposed_option_number: 1,
//   proposed_options_total: 2,
//   proposed_option_accepted: true,
//   creator_id: 'bb222faf-a07b-065a-b158-cf2c15277962'
// }, {
//   id: 'id2',
//   name: 'Discussion Group',
//   description: 'Description 2',
//   participants: [],
//   note: 'Proposed time: 5pm',
//   pills: [{
//     text: 'long: 1 hour',
//     color: 'warning'
//   }],
//   is_confirmed: false,
//   proposed_option_number: 2,
//   proposed_options_total: 2,
//   proposed_option_accepted: false,
//   creator_id: 'bb222faf-a07b-065a-b158-cf2c15277962',
//   proposed_times: []
// }];

export class MeetingStatus {
  static CREATED = 'created';
  static PROPOSED = 'proposed';
  static CONFIRMED = 'confirmed';
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

export function getAgendaList(userId, status) {
  const params = {
    user_id: userId
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
        return expandMeeting(meeting, userId, meetingsMap);
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
      participants: meeting.participants,
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


export function getConfirmedAgendaList(userId) {
  return getAgendaList(userId, MeetingStatus.CONFIRMED);
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

export function getMeetingById(id) {
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     const items = LIST_ITEMS.filter((item) => item.id === id);
  //     return resolve(items.length > 0 ? items[0] : null);
  //   }, 1000);
  // }); 
  return getAPIGatewaySDK().then((sdk) => {
    return sdk.meetingsIdGet({
      id: id,
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






