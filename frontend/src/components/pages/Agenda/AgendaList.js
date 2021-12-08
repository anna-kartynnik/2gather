import React from 'react';

import './AgendaList.scss';

import Stack from 'react-bootstrap/Stack';
import Alert from 'react-bootstrap/Alert';
import AgendaListItem from './AgendaListItem';
import Spinner from './../../Spinner/Spinner';

import moment from 'moment';
import { MeetingStatus } from './../../../services/aws/meetings';


function AgendaList(props) {

  const createdList = props.listItems.filter((item) => item.status === MeetingStatus.CREATED);
  const others = props.listItems.filter((item) => item.status !== MeetingStatus.CREATED);

  return (
    <div className="agenda-list">
      { props.status !== MeetingStatus.CREATED &&
        <MeetingList {...props} listItems={others} />
      }
      { props.status === MeetingStatus.CREATED &&
        <CreatedList {...props} listItems={createdList} />
      }
    </div>
  );
}

function CommonList(props) {
  if (props.isLoading) {
    return (
      <Spinner />
    );
  }

  if (props.listItems.length === 0) {
    return (
      <div>There are no meetings.</div>
    );
  }
  return (
    <Stack direction="vertical" gap={2}>
      { props.children }
    </Stack>
  );
}

function CreatedList(props) {
  return (
    <div className="just-created">
      <Alert variant="secondary">
        Time suggestions for these meetings should be ready in a few minutes...
      </Alert>
      <CommonList
        {...props}>
        { props.listItems.map(
            (item, index) => {
              return (
                <AgendaListItem
                  key={item.id}
                  {...props}
                  item={item}
                />
              )
            }
          )
        }
      </CommonList>
    </div>
  );
}

function getTime(meeting) {
  if (meeting.status === MeetingStatus.CONFIRMED) {
    return meeting.confirmed_time;
  } else {
    return meeting.proposed_time;
  }
}

function MeetingList(props) {
  return (
    <CommonList
      {...props}>
      { props.listItems.map(
        (item, index) => {
          let dateComponent = null;
          if (index === 0 || moment(getTime(props.listItems[index - 1])).date() !== moment(getTime(item)).date()) {
            dateComponent = (<h6>{ moment(getTime(item)).format('ddd, MMM Do') }</h6>);
          }
          return (
            <div key={item.id + (item.proposed_option_number || '0')}>
              {dateComponent}
              <AgendaListItem
                {...props}
                item={item}
              />
            </div>
          )
        }
      )}
    </CommonList>
  );
}

export default AgendaList;
