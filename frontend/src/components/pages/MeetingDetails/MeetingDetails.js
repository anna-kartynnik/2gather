import React, { useState, useEffect } from 'react';

import './MeetingDetails.scss';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import PageActions from './../../PageActions/PageActions';
import Spinner from './../../Spinner/Spinner';
import ProposedTimesList from './../../ProposedTimesList/ProposedTimesList';
import MeetingQuestionList from './../../MeetingQuestionList/MeetingQuestionList';

import playIcon from './../../../images/play.svg';

import { getMeetingById, MeetingStatus } from './../../../services/aws/meetings';

import moment from 'moment';


function MeetingDetails(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [refresh, setRefresh] = useState(null);
  console.log(props);
  const meetingId = props.match.params.id;
  const presentationPath = `/meetings/${meetingId}/present`;

  const { showToast, userProfile } = props;

  useEffect(() => {
    setIsLoading(true);
    getMeetingById(meetingId, userProfile.awsUserProfile.id).then((resp) => {
      console.log(resp);
      setMeeting(resp.data);
      setIsLoading(false);
    }).catch((err) => {
      console.log(err);
      showToast(err?.message, 'danger');
      setIsLoading(false);
    });
  }, [meetingId, refresh]);

  const handlePresentationModeClick = () => {
    console.log('TODO');
  }

  const handleRefresh = () => {
    setRefresh(new Date().getTime());
  }

  return (
    <div className="meeting-details-page">
      <PageActions
        title={meeting?.name || ''}
        buttonComponent={
          <Button variant="primary" size="lg" as={Link} to={presentationPath}>
            {/*onClick={handlePresentationModeClick}>*/}
            <img src={playIcon} alt="play" className="presentation"/>
            Presentation&nbsp;mode
          </Button>
        }
      />
      { isLoading &&
        <Spinner />
      }
      { !isLoading && meeting &&
        <MeetingDetailsBody
          meeting={meeting}
          currentUserId={userProfile.awsUserProfile.id}
          showToast={props.showToast}
          handleRefresh={handleRefresh}
        />
      }
      <MeetingQuestionList
        meetingId={meetingId}
        showToast={props.showToast}
        userProfile={userProfile}
      />
    </div>
  );
}

function MeetingTime(props) {
  const { meeting } = props;
  let label = '';
  let component = null;
  if (meeting.status === MeetingStatus.CREATED) {
    label = 'Preferred time range';
    component = (
      <div>
        {moment(meeting.preferred_time_start).format('MMM, D h:mm')}
        &nbsp;-&nbsp;
        {moment(meeting.preferred_time_end).format('h:mma')}
      </div>
    );
  } else if (meeting.status === MeetingStatus.PROPOSED) {
    label = 'Proposed time slots';
    component = (
      <ProposedTimesList
        item={meeting}
        currentUserId={props.currentUserId}
        showToast={props.showToast}
        handleRefresh={props.handleRefresh}
      />
    );
  } else {
    label = 'Meeting time';
    component = (
      <div>
        {moment(meeting.confirmed_time).format('MMM, D h:mm')}
        &nbsp;-&nbsp;
        {moment(meeting.confirmed_time).add(meeting.duration, 'minutes').format('h:mma')}
      </div>
    );
  }

  return (
    <>
      <Row className="label">
        <div>{label}</div>
      </Row>
      <Row>
        {component}
      </Row>
    </>
  );
}

function MeetingParticipant(props) {
  return (
    <span className="mx-1">{props.value}</span>
  );
}

function MeetingDetailsBody(props) {
  const { meeting } = props;
  console.log(meeting);
  return (
    <>
      <Row className="label">
        <div>Description</div>
      </Row>
      <Row>
        <div>{meeting.description || 'No description'}</div>
      </Row>
      <Row className="label">
        <div>Participants</div>
      </Row>
      <Row>
        <div>{
          meeting.participants.map((p) => (
            <MeetingParticipant
              key={p.id}
              value={p.email}
            />
          ))
        }</div>
      </Row>
      <MeetingTime
        meeting={meeting}
        currentUserId={props.currentUserId}
        showToast={props.showToast}
        handleRefresh={props.handleRefresh}
      />
      <Row className="label">
        <div>Attachments</div>
      </Row>
      <Row>
        <div>{meeting.attachments.map((attachment) => {
          const nameParts = attachment.object_key.split('-');
          let name = '';
          for (let i = 1; i < nameParts.length; i++) {
            name += nameParts[i];
          }
          return (
            <a key={attachment.id} href={attachment.url} target="_blank noopener noreferrer">{name}</a>
          );
        })}</div>
      </Row>
    </>
  );
}

export default MeetingDetails;
