// [TODO] add backend integration

const LIST_ITEMS = [{
  id: 'id1',
  title: 'Stand-up meeting',
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
  title: 'Discussion Group',
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
  title: 'Discussion Group',
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


export function getAgendaList() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve(LIST_ITEMS);
    }, 2000);
  });
}

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






