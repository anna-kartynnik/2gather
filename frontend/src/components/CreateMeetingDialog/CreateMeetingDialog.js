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


function CreateMeetingDialog(props) {

  const handleSubmit = () => {
    // TODO
    props.onClose();
  }

  return (
      <Modal show={props.showDialog} onHide={props.onClose} className='create-dialog'>
        <Modal.Header closeButton>
          <Modal.Title>Create new meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Name</Form.Label>
              <Form.Control type='text' placeholder='Enter a new meeting name' required/>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea' rows={2} placeholder='Enter a new meeting description'/>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Participants</Form.Label>
              <ParticipantAutoComplete

              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Preferred time range</Form.Label>
              <DateTimeRangeInput

              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Duration (in min)</Form.Label>
              <DurationInput

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
          <Button variant='primary' onClick={props.handleSubmit}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>    
  );
}

export default CreateMeetingDialog;
