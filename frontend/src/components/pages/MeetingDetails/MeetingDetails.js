import React, { useState, useEffect } from 'react';

import './MeetingDetails.scss';

import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import PageActions from './../../PageActions/PageActions';

import playIcon from './../../../images/play.svg';

import { getMeetingById } from './../../../services/aws/meetings';


function MeetingDetails(props) {
  const [meeting, setMeeting] = useState({});
  console.log(props);

  useEffect(() => {
    getMeetingById(props.match.params.id).then((resp) => {
      console.log(resp);
      setMeeting(resp.data);
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  const handlePresentationModeClick = () => {
    console.log('TODO');
  }

  return (
    <div className='meeting-details-page'>
      <PageActions
        title={meeting.name || ''}
        buttonComponent={
          <Button variant='primary' size='lg'
            onClick={handlePresentationModeClick}>
            <img src={playIcon} alt='play' />
            Presentation&nbsp;mode
          </Button>
        }
      />
      <Row className='label'>
        <div>Description</div>
      </Row>
      <Row>
        <div>{meeting.description}</div>
      </Row>
      <Row className='label'>
        <div>Participants</div>
      </Row>
      <Row>
        <div>{meeting.participants}</div>
      </Row>
      <Row className='label'>
        <div>Meeting time</div>
      </Row>
      <Row>
        <div>{meeting.time}</div>
      </Row>
      <Row className='label'>
        <div>Attachments</div>
      </Row>
      <Row>
        <div>{meeting.attachments}</div>
      </Row>
    </div>
  );
}

export default MeetingDetails;
