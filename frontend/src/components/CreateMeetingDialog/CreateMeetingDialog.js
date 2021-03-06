import { useState } from 'react';

import './../scss/CreateDialog.scss';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import DateTimeRangeInput from './../DateTimeRangeInput/DateTimeRangeInput';
import DurationInput from './../DurationInput/DurationInput';
import ParticipantAutoComplete from './../ParticipantAutoComplete/ParticipantAutoComplete';
import Spinner from './../Spinner/Spinner';

import { createMeeting, uploadAttachmentPut, ATTACHMENTS_BUCKET_NAME } from './../../services/aws/meetings';
import moment from 'moment';


function CreateMeetingDialog(props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState([props.userProfile.awsUserProfile]);
  const [preferredTimeRange, setPreferredTimeRange] = useState([]);  // moment objects
  const [duration, setDuration] = useState(60);
  const [attachments, setAttachments] = useState([]);
  const [createWithoutVotes, setCreateWithoutVotes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invalid, setInvalid] = useState({});

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
    if (!preferredTimeRange || preferredTimeRange.length !== 2 || !preferredTimeRange[0] || !preferredTimeRange[1]) {
      invalidCollection['preferredTimeRange'] = 'Preferred time range is required';
      isFormValid = false;
    } else if (moment(preferredTimeRange[0]).isBefore(moment())) {
      invalidCollection['preferredTimeRange'] = 'Preferred time range should be in the future';
      isFormValid = false;
    }
    if (!duration) {
      invalidCollection['duration'] = 'Duration is required';
      isFormValid = false;
    } else if (duration < 10 || duration > 60 * 10) {
      invalidCollection['duration'] = 'Duration value is invalid: should be between 10 and 600';
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
    createMeeting({
      name,
      description,
      participants: participants,
      preferredTimeStart: preferredTimeRange[0].toISOString(),
      preferredTimeEnd: preferredTimeRange[1].toISOString(),
      duration,
      creatorId: props.userProfile.awsUserProfile.id,
      attachments: attachments,
      schedulingMode: createWithoutVotes ? 'without-votes' : 'with-votes'
    }).then((resp) => {
      setIsLoading(false);
      props.showToast(
        'Your meeting has been successfully created. Give us a few seconds and check the pending items to see the suggested time slots.',
        'toast',
        //'middle-center'
      );
      props.onCloseAndRefresh();
    }).catch((err) => {
      setIsLoading(false);
      props.showToast(
        err?.message,
        'danger',
        //'middle-center'
      );
    });
  };

  const handleFileChange = (evt) => {
    if (evt.target && evt.target.files) {
      //setSelectedPhoto(evt.target.files[0]);
      const attachment = evt.target.files[0];
      const attachmentKey = encodeURIComponent(`${new Date().getTime()}-${attachment.name}`);
      uploadAttachmentPut(attachment, attachmentKey).then((response) => {
        console.log(response);
        setAttachments([{
          bucket: ATTACHMENTS_BUCKET_NAME,
          object_key: attachmentKey
        }]);
        //handleClose();
        //props.onSuccess();
      })
      .catch((err) => {
        console.log('an error occurred while uploading the file', err);
        setIsLoading(false);
        props.showToast(
          err?.message,
          'danger'
        );
      });
    }
  };

  const handleSchedulingModeChange = (evt) => {
    console.log(evt.target);
    if (evt.target.id === "mode-with-votes") {
      setCreateWithoutVotes(false);
    } else {
      setCreateWithoutVotes(true);
    }
  }

  return (
    <Modal show={props.showDialog} onHide={props.onClose}
      className="create-dialog" fullscreen="lg-down"
      backdrop="static">
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
              initialValue={participants}
              onChange={handleParticipantsChange}
            />
            { invalid['participants'] &&
              <div className="invalid">
                { invalid['participants'] }
              </div>
            }
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Preferred time range</Form.Label>
            <DateTimeRangeInput
              value={preferredTimeRange}
              onChange={setPreferredTimeRange}
            />
            { invalid['preferredTimeRange'] &&
              <div className="invalid">
                { invalid['preferredTimeRange'] }
              </div>
            }
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Duration (in min)</Form.Label>
            <DurationInput
              value={duration}
              required
              min={10}
              max={60 * 10} /* ? */
              onChange={setDuration}
            />
            { invalid['duration'] &&
              <div className="invalid">
                { invalid['duration'] }
              </div>
            }
          </Form.Group>
          <Form.Group controlId='formFile' className='mb-3'>
            <Form.Label>Attachments</Form.Label>
            <Form.Control
              type="file"
              name="file"
              onChange={handleFileChange}
            />
          </Form.Group>
          <Form.Group controlId="scheduleMode" className="my-4">
            <Form.Check
              type="radio"
              name="mode"
              id="mode-with-votes"
              label="Create this meeting automatically when all the participants have voted"
              checked={!createWithoutVotes}
              onChange={handleSchedulingModeChange}
            />
            <Form.Check
              type="radio"
              name="mode"
              id="mode-without-votes"
              label="Create this meeting automatically without waiting for the votes"
              checked={createWithoutVotes}
              onChange={handleSchedulingModeChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          { isLoading &&
            <Spinner variant="white" as="span" size="sm" />
          }
          { isLoading && ' ' }
          Create
        </Button>
      </Modal.Footer>
    </Modal>    
  );
}

export default CreateMeetingDialog;
