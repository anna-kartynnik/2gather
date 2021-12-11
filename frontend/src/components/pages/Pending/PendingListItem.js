import React, { useState } from 'react';

import './PendingListItem.scss';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

import moment from 'moment';

import {
  MeetingListItemCreatorActions,
  MeetingListItemParticipantActions
} from './../../MeetingActions/MeetingActions';
import Spinner from './../../Spinner/Spinner';
import ProposedTimesList from './../../ProposedTimesList/ProposedTimesList';

import { saveMeetingTimeVote, confirmMeeting } from './../../../services/aws/meetings';


function PendingListItem(props) {

  return (
    <Row className="g-0 py-3 px-4 pending-list-item">
      <Col className="title-container" sm={9}>
        <Link to={`/meetings/${props.item.id}`}>
          <div className="title">
            { props.item.name }
          </div>
        </Link>
        <div className="note">
          <ProposedTimesList
            {...props}
            showLabel={true}
          />
{/*          <Stack direction="horizontal" gap={2}>
            <span>Vote for time:</span>
            { props.item.proposed_times.map((pt) =>
              <ProposedTimeBadge
                key={pt.meeting_proposed_time_id}
                item={pt}
                currentUserId={props.currentUserId}
                showToast={props.showToast}
                handleRefresh={props.handleRefresh}
              />
            )}
          </Stack>*/}
        </div>
      </Col>
      <Col sm={3}>
        {/* [TODO] if current user === creator */}
        { props.item.creator_id === props.currentUserId &&
          <MeetingListItemCreatorActions
            item={props.item}
            handleDelete={props.handleDelete}
            handleEdit={props.handleEdit}
            handleConfirm={props.handleConfirm}
          />
        }
        { props.item.creator_id !== props.currentUserId &&
          <MeetingListItemParticipantActions
            item={props.item}
          />
        }
      </Col>
    </Row>
  );
}

function ProposedTimeBadge(props) {
  const [isLoading, setIsLoading] = useState(false);

  const toggleVote = () => {
    // [TODO] confirm deletion?
    setIsLoading(true);
    // if (props.currentUserId === props.item.creator_id) {
    //   // Creator confirms the slot.
    //   const changedMeeting = props.item;
    //   changedMeeting.confirmed_time = props.item.proposed_time;
    //   confirmMeeting(changedMeeting).then((data) => {
    //     console.log(data);
    //     setIsLoading(false);
    //     props.showToast('Your meeting has been confirmed!');
    //     props.handleRefresh();
    //   }).catch((err) => {
    //     console.log(err);
    //     setIsLoading(false);
    //     props.showToast(
    //       err?.message ?? 'An error occurred',
    //       'danger'
    //     );
    //   });
    // } else {
      // Participant votes for time.
      saveMeetingTimeVote(props.item.meeting_proposed_time_id, props.currentUserId, props.item.vote_id).then((data) => {
        console.log(data);
        setIsLoading(false);
        props.showToast('Thank you for your vote!');
        props.handleRefresh();
      }).catch((err) => {
        console.log(err);
        setIsLoading(false);
        props.showToast(
          err?.message ?? 'An error occurred',
          'danger'
        );
      });
    //}
  };

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  return (
    <Button onClick={toggleVote} variant="link" className="proposed-time-badge">
      <Badge pill bg="light" className={`time ${props.item.vote_id !== null ? "voted" : "not-voted"}`}>
        {moment(props.item.proposed_time).format('ddd, h:mm')}
        &nbsp;-&nbsp;
        {moment(props.item.proposed_time).add(props.item.duration, 'minutes').format('h:mma')}
        &nbsp;
        <Badge pill bg="success" className="votes">
          { props.item.number_of_votes }
        </Badge>
      </Badge>
    </Button>
  );
}

export default PendingListItem;
