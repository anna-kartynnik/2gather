import { useState, useEffect } from 'react';

import './EditMeetingDialog.scss';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Alert from 'react-bootstrap/Alert';

import DateTimeRangeInput from './../DateTimeRangeInput/DateTimeRangeInput';
import DurationInput from './../DurationInput/DurationInput';
import ParticipantAutoComplete from './../ParticipantAutoComplete/ParticipantAutoComplete';
import Spinner from './../Spinner/Spinner';

import { getMeetingById, updateMeeting } from './../../services/aws/meetings';
import moment from 'moment';


function EditMeetingDialog(props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState([]);//props.userProfile.awsUserProfile]);
  //const [preferredTimeRange, setPreferredTimeRange] = useState([]);  // moment objects
  //const [duration, setDuration] = useState(60);
  const [isLoading, setIsLoading] = useState(true);
  const [invalid, setInvalid] = useState({});

  const [savedMeeting, setSavedMeeting] = useState({});
  console.log(props);

  useEffect(() => {
    getMeetingById(props.meetingId).then((resp) => {
      console.log(resp);
      const meeting = resp.data;
      setName(meeting.name);
      setDescription(meeting.description);
      setParticipants(meeting.participants);
      setSavedMeeting(meeting);
      setIsLoading(false);
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
      props.showToast(
        err?.message ?? 'An error occurred',
        'danger',
        //'middle-center'
      );
    });
  }, []);

  const handleNameChange = (evt) => {
    setName(evt.target.value);
  };

  const handleDescriptionChange = (evt) => {
    setDescription(evt.target.value);
  };

  const handleParticipantsChange = (newParticipants) => {
    setParticipants(newParticipants);
  };

  const validateForm = () => {
    const invalidCollection = {};
    let isFormValid = true;
    if (!name) {
      invalidCollection['name'] = 'Name is required';
      isFormValid = false;
    }
    if (!participants || participants.length === 0) {
      invalidCollection['participants'] = 'Participants are required';
      isFormValid = false;
    }
    // if (!preferredTimeRange || preferredTimeRange.length !== 2 || !preferredTimeRange[0] || !preferredTimeRange[1]) {
    //   invalidCollection['preferredTimeRange'] = 'Preferred time range is required';
    //   isFormValid = false;
    // } else if (moment(preferredTimeRange[0]).before(moment())) {
    //   invalidCollection['preferredTimeRange'] = 'Preferred time range should be in the future';
    //   isFormValid = false;
    // }
    // if (!duration) {
    //   invalidCollection['duration'] = 'Duration is required';
    //   isFormValid = false;
    // } else if (duration < 10 || duration > 60 * 10) {
    //   invalidCollection['duration'] = 'Duration value is invalid: should be between 10 and 600';
    //   isFormValid = false;
    // }

    setInvalid(invalidCollection);
    return isFormValid;
  };

  const handleSubmit = () => {
    if (isLoading) {
      return;
    }
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsLoading(true);
    updateMeeting({
      id: savedMeeting.id,
      name,
      description,
      participants: participants.map((p) => p.id),
      status: savedMeeting.status,
      //preferredTimeStart: preferredTimeRange[0].toISOString(),
      //preferredTimeEnd: preferredTimeRange[1].toISOString(),
      //duration,
      //creatorId: props.userProfile.awsUserProfile.id
    }).then((resp) => {
      setIsLoading(false);
      props.showToast(
        'Your meeting has been successfully updated.',
        'toast',
        //'middle-center'
      );
      props.onCloseAndRefresh();
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
      props.showToast(
        err?.message,
        'danger',
        //'middle-center'
      );
    });
  };

  let modalBody = null;
  if (!savedMeeting || !savedMeeting.participants || savedMeeting.participants.length === 0) {
    modalBody = (
      <Spinner />
    );
  } else {
    modalBody = (
      <Form>
        <Alert variant="secondary" className="my-2 p-3">
          Please note that date information can be change via rescheduling action.
        </Alert>
        <Form.Group className='mb-3'>
          <Form.Label>Name</Form.Label>
          <Form.Control type='text'
            placeholder='Enter a new meeting name'
            required
            value={name}
            onChange={handleNameChange}
          />
          { invalid['name'] &&
            <div className="invalid">
              { invalid['name'] }
            </div>
          }
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
            initialValue={savedMeeting.participants}
            onChange={handleParticipantsChange}
          />
          { invalid['participants'] &&
            <div className="invalid">
              { invalid['participants'] }
            </div>
          }
        </Form.Group>
        <Form.Group className='mb-3'>
          <Form.Label>Preferred time range and duration</Form.Label>
          <div>
            <i>
              { moment(savedMeeting.preferred_time_start).format('ddd, MMM Do') }
              &nbsp;-&nbsp;
              { moment(savedMeeting.preferred_time_end).format('ddd, MMM Do') }&nbsp;&nbsp;&nbsp;
              ({savedMeeting.duration} min)
            </i>
          </div>
{/*            <DateTimeRangeInput
              disabled={true}
              value={savedMeeting.preferredTimeRange}
              //onChange={setPreferredTimeRange}
            />*/}
{/*            { invalid['preferredTimeRange'] &&
              <div className="invalid">
                { invalid['preferredTimeRange'] }
              </div>
            }*/}
        </Form.Group>
{/*          <Form.Group className='mb-3'>
            <Form.Label>Duration (in min)</Form.Label>
            <DurationInput
              disabled={true}
              value={savedMeeting.duration}
              //required
              //min={10}
              //max={60 * 10}
              //onChange={setDuration}
            />
            { invalid['duration'] &&
              <div className="invalid">
                { invalid['duration'] }
              </div>
            }
          </Form.Group>*/}
          {/*<Form.Group controlId='formFile' className='mb-3'>
            <Form.Label>Attachments</Form.Label>
            <Form.Control type='file' />
          </Form.Group>*/}
      </Form>
    );
  }

  return (
    <Modal show={props.showDialog} onHide={props.onClose}
      className="edit-dialog" fullscreen="lg-down"
      backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit meeting</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        { modalBody }
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose} disabled={isLoading}>
          Cancel
        </Button>
        { savedMeeting &&
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            { isLoading &&
              <Spinner variant="white" as="span" size="sm" />
            }
            { isLoading && ' ' }
            Save
          </Button>
        }
      </Modal.Footer>
    </Modal>    
  );
}

export default EditMeetingDialog;
