const { handler } = require('./index.js');

const USER_ID = 'dd3f4560-9a5b-39d0-b0c0-ba55f07de8e3';
const TEST_EMAIL = 'testtest@yopmail.com';

function getMeeting(name, description, creatorId, preferredTimeStart, preferredTimeEnd, duration, participants) {
  return {
    name,
    description,
    creator_id: creatorId,
    preferred_time_start: preferredTimeStart,
    preferred_time_end: preferredTimeEnd,
    duration,
    participants
  };
}

(async () => {
  // meeting creation
  let response = await handler({
    body: JSON.stringify(getMeeting(
      'Meeting namee',
      'short description',
      USER_ID,
      new Date('2022-12-01').toISOString(),
      new Date('2022-12-08').toISOString(),
      60,
      [
        USER_ID,
        `email:${TEST_EMAIL}`
      ]
    ))
  });
  console.log('successful response');
  console.log(response);

  // wrong data
  let meeting = getMeeting(
    'Meeting namee',
    'short description',
    USER_ID,
    new Date('2022-11-01').toISOString(),
    new Date('2022-12-01').toISOString(),
    60,
    [USER_ID]
  );
  for (let key of ['name', 'creator_id', 'preferred_time_start', 'preferred_time_end', 'duration', 'participants']) {
    const value = meeting[key];
    const wrongValues = [null];
    if (value instanceof Array) {
      wrongValues.push([]);
    }
    for (let wrongValue of wrongValues) {
      meeting[key] = wrongValue;
      response = await handler({
        body: JSON.stringify(meeting)
      });
      console.log(`empty '${key}'`);
      console.log(response);
    }
    meeting[key] = value;
  }
  meeting.duration = 'wrong number';
  response = await handler({
    body: JSON.stringify(meeting)
  });
  console.log('duration is not integer');
  console.log(response);

  meeting.duration = 1;
  response = await handler({
    body: JSON.stringify(meeting)
  });
  console.log('duration is less than lower bound');
  console.log(response);

  meeting.duration = Math.round(Math.random() * 10 + 60 * 10);
  response = await handler({
    body: JSON.stringify(meeting)
  });
  console.log('duration is greater than upper bound');
  console.log(response);

  meeting.duration = 60;
  meeting.preferred_time_start = 'wrong date';
  response = await handler({
    body: JSON.stringify(meeting)
  });
  console.log('preferred_time_start is invalid date');
  console.log(response);

  meeting.preferred_time_start = new Date('2022-12-01');
  meeting.preferred_time_end = 'wrong date';
  response = await handler({
    body: JSON.stringify(meeting)
  });
  console.log('preferred_time_end is invalid date');
  console.log(response);

  meeting.preferred_time_end = new Date('2022-11-01');
  response = await handler({
    body: JSON.stringify(meeting)
  });
  console.log('preferred_time_end is before preferred_time_start');
  console.log(response);

  meeting.preferred_time_start = new Date('2021-11-01');
  response = await handler({
    body: JSON.stringify(meeting)
  });
  console.log('preferred_time_start is in the past');
  console.log(response);

  meeting.preferred_time_end = new Date('2022-11-01');
  meeting.participants.push('email:test');
  response = await handler({
    body: JSON.stringify(meeting)
  });
  console.log('wrong email in participants');
  console.log(response);

  // empty data
  response = await handler({
    body: JSON.stringify({
    })
  });
  console.log('empty data');
  console.log(response);
})();
