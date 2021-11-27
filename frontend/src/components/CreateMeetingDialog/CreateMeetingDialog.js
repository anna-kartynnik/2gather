import { useState } from 'react';

import './CreateMeetingDialog.scss';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import DateTimeRangeInput from './../DateTimeRangeInput/DateTimeRangeInput';
import DurationInput from './../DurationInput/DurationInput';
import ParticipantAutoComplete from './../ParticipantAutoComplete/ParticipantAutoComplete';

import { createMeeting } from './../../services/aws/meetings';
import moment from 'moment';


function CreateMeetingDialog(props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState([]);
  const [preferredTimeRange, setPreferredTimeRange] = useState([]);  // moment objects
  const [duration, setDuration] = useState(60);

  const handleNameChange = (evt) => {
    setName(evt.target.value);
  };

  const handleDescriptionChange = (evt) => {
    setDescription(evt.target.value);
  };

  const handleParticipantsChange = (newParticipants) => {
    setParticipants(newParticipants);
  };

  const handleSubmit = () => {
    // TODO add validation
    console.log('handleSubmit');
    createMeeting({
      name,
      description,
      // participants
      participants: [props.userProfile.awsUserProfile.id],
      preferredTimeStart: preferredTimeRange[0].toISOString(),
      preferredTimeEnd: preferredTimeRange[1].toISOString(),
      duration,
      creatorId: props.userProfile.awsUserProfile.id
    }).then((resp) => {
      // isloading
      props.showToast('Your meeting has been successfully created. Give us a few seconds and check the pending items to see the suggested time slots.');
      props.onClose();
    }).catch((err) => {
      // isloading
      props.showToast(err?.message);
    });
  };

  return (
      <Modal show={props.showDialog} onHide={props.onClose} className='create-dialog'>
        <Modal.Header closeButton>
          <Modal.Title>Create new meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Name</Form.Label>
              <Form.Control type='text'
                placeholder='Enter a new meeting name'
                required
                value={name}
                onChange={handleNameChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea'
                rows={2}
                placeholder='Enter a new meeting description'
                value={description}
                onChange={handleDescriptionChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Participants</Form.Label>
              <ParticipantAutoComplete
                onChange={handleParticipantsChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Preferred time range</Form.Label>
              <DateTimeRangeInput
                value={preferredTimeRange}
                onChange={setPreferredTimeRange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Duration (in min)</Form.Label>
              <DurationInput
                value={duration}
                onChange={setDuration}
              />
            </Form.Group>
            <Form.Group controlId='formFile' className='mb-3'>
              <Form.Label>Attachments</Form.Label>
              <Form.Control type='file' />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={props.onClose}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleSubmit}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>    
  );
}

export default CreateMeetingDialog;
