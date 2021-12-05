const propose_utils = require('./propose.js');

propose_utils.getProposedSlots(
  [{
    start: '2021-12-07T20:00:00Z',
    end: '2021-12-07T21:00:00Z'
  }, {
    start: '2021-12-06T13:00:00Z',
    end: '2021-12-06T14:00:00Z'
  }, {
    start: '2021-12-06T22:00:00Z',
    end: '2021-12-06T23:00:00Z'
  }, {
    start: '2021-12-06T23:00:00Z',
    end: '2021-12-07T01:00:00Z'
  }],
  '2021-12-07T16:00:00.811Z',
  '2021-12-08T02:00:00.811Z',
  60,
  [-8]
);