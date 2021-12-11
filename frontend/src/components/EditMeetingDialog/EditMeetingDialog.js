import { useState, useEffect } from 'react';

import './EditMeetingDialog.scss';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import ParticipantAutoComplete from './../ParticipantAutoComplete/ParticipantAutoComplete';
import Spinner from './../Spinner/Spinner';

import { getMeetingById, updateMeeting } from './../../services/aws/meetings';
import moment from 'moment';


function EditMeetingDialog(props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [invalid, setInvalid] = useState({});

  const [savedMeeting, setSavedMeeting] = useState({});
  console.log(props);

  const { meetingId, showToast } = props;

  useEffect(() => {
    getMeetingById(meetingId).then((resp) => {
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
      showToast(
        err?.message ?? 'An error occurred',
        'danger',
        //'middle-center'
      );
    });
  }, [meetingId/*, showToast*/]);

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
      participants: participants,
      status: savedMeeting.status,
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
            currentUser={props.userProfile.awsUserProfile}
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
