import React from 'react';

import './MeetingActions.scss';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';

import editIcon from './../../images/pencil.svg';
import rescheduleIcon from './../../images/reschedule.svg';
import deleteIcon from './../../images/delete.svg';
import confirmTimeIcon from './../../images/confirm.svg';
import calendarIcon from './../../images/calendar.svg';
import calendarAcceptedIcon from './../../images/calendar_accepted.svg';

import { MeetingStatus } from './../../services/aws/meetings';


export function MeetingListItemCreatorActions(props) {

  return (
    <Stack direction="horizontal" className="meeting-list-item-actions">
      { props.item.status === MeetingStatus.PROPOSED &&
        <Button variant="link" title="Confirm time"
          className="ms-auto" onClick={props.handleConfirm(props.item)}>
          <img src={confirmTimeIcon} alt="Confirm time" />
        </Button>
      }
      <Button variant="link" title="Edit"
        className={props.item.status !== MeetingStatus.PROPOSED ? "ms-auto" : ""}
        onClick={props.handleEdit(props.item)}>
        <img src={editIcon} alt="Edit" />
      </Button>
      <Button variant="link" title="Reschedule">
        <img src={rescheduleIcon} alt="Reschedule" />
      </Button>
      <Button variant="link" title="Delete" onClick={props.handleDelete(props.item)}>
        <img src={deleteIcon} alt="Delete" />
      </Button>
    </Stack>
  );
}

export function MeetingListItemParticipantActions(props) {
  if (props.item.status !== MeetingStatus.PROPOSED) {
    return null;
  }

  return (
    <Stack direction="horizontal" className="meeting-list-item-actions">
      { !props.item.vote_id &&
        <Button variant="link" title="Vote for this time" className="ms-auto">
          <img src={calendarIcon} alt="Vote for this time" />
        </Button>
      }
      { props.item.vote_id &&
        <Button variant="link" title="Remove your vote for this time" className="ms-auto">
          <img src={calendarAcceptedIcon} alt="Remove your vote" />
        </Button>
      }
    </Stack>
  );
}
