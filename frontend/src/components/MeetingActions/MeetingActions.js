import React, { useState } from 'react';

import './MeetingActions.scss';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';

import Spinner from './../Spinner/Spinner';

import editIcon from './../../images/pencil.svg';
import rescheduleIcon from './../../images/reschedule.svg';
import deleteIcon from './../../images/delete.svg';
import confirmTimeIcon from './../../images/confirm.svg';
import calendarIcon from './../../images/calendar.svg';
import calendarAcceptedIcon from './../../images/calendar_accepted.svg';

import { MeetingStatus, saveMeetingTimeVote } from './../../services/aws/meetings';


export function MeetingListItemCreatorActions(props) {
  if (props.item.status === MeetingStatus.CONFIRMED) {
    // Since confirmed, user can remove/change the meeting only from Google Calendar.
    return null;
  }
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
      <Button variant="link" title="Reschedule"
        onClick={props.handleReschedule(props.item)}>
        <img src={rescheduleIcon} alt="Reschedule" />
      </Button>
      <Button variant="link" title="Delete" onClick={props.handleDelete(props.item)}>
        <img src={deleteIcon} alt="Delete" />
      </Button>
    </Stack>
  );
}

export function MeetingListItemParticipantActions(props) {
  const [isLoading, setIsLoading] = useState(false);
  if (props.item.status !== MeetingStatus.PROPOSED) {
    return null;
  }

  const toggleVote = () => {
    setIsLoading(true);

    // Participant votes for time.
    saveMeetingTimeVote(props.item.meeting_proposed_time_id, props.currentUserId, props.item.vote_id).then((data) => {
      console.log(data);
      setIsLoading(false);
      props.handleRefresh && props.handleRefresh();
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
    });
  };

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  return (
    <Stack direction="horizontal" className="meeting-list-item-actions">
      { !props.item.vote_id &&
        <Button variant="link" title="Vote for this time" className="ms-auto" onClick={toggleVote}>
          <img src={calendarIcon} alt="Vote for this time" />
        </Button>
      }
      { props.item.vote_id &&
        <Button variant="link" title="Remove your vote for this time" className="ms-auto" onClick={toggleVote}>
          <img src={calendarAcceptedIcon} alt="Remove your vote" />
        </Button>
      }
    </Stack>
  );
}
