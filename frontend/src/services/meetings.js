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
  proposed_options_total: 2
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
  proposed_options_total: 2
}];


export function getAgendaList() {
  return new Promise((resolve, reject) => {
    return resolve(LIST_ITEMS);
  });
}

export function getConfirmedAgendaList() {
  return new Promise((resolve, reject) => {
    return resolve(LIST_ITEMS.filter((item) => item.is_confirmed === true));
  });
}

