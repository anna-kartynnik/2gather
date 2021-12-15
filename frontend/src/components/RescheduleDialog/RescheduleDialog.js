import { useState, useEffect } from 'react';

import './../scss/CreateDialog.scss';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import DateTimeRangeInput from './../DateTimeRangeInput/DateTimeRangeInput';
import DurationInput from './../DurationInput/DurationInput';
import Spinner from './../Spinner/Spinner';

import { rescheduleMeeting, getMeetingById, MeetingStatus } from './../../services/aws/meetings';
import moment from 'moment';


function RescheduleDialog(props) {
  const [preferredTimeRange, setPreferredTimeRange] = useState([]);  // moment objects
  const [duration, setDuration] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [invalid, setInvalid] = useState({});
  const [savedMeeting, setSavedMeeting] = useState({});

  const { meetingId, userId, showToast } = props;

  useEffect(() => {
    setIsInitialLoading(true);
    getMeetingById(meetingId, userId).then((resp) => {
      console.log(resp);
      const meeting = resp.data;
      setPreferredTimeRange([
        moment(meeting.preferred_time_start),
        moment(meeting.preferred_time_end)
      ]);
      setDuration(parseInt(meeting.duration, 10));
      setSavedMeeting(meeting);
      setIsInitialLoading(false);
    }).catch((err) => {
      console.log(err);
      setIsInitialLoading(false);
      showToast(
        err?.message ?? 'An error occurred',
        'danger',
        //'middle-center'
      );
    });
  }, [meetingId/*, showToast*/]);

  const validateForm = () => {
    const invalidCollection = {};
    let isFormValid = true;
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
    rescheduleMeeting({
      id: meetingId,
      preferredTimeStart: preferredTimeRange[0].toISOString(),
      preferredTimeEnd: preferredTimeRange[1].toISOString(),
      duration
    }).then((resp) => {
      setIsLoading(false);
      props.showToast(
        'Your meeting has been successfully rescheduled. Give us a few seconds and check the pending items to see the suggested time slots.',
        'toast'
      );
      props.onCloseAndRefresh();
    }).catch((err) => {
      setIsLoading(false);
      props.showToast(
        err?.message,
        'danger'
      );
    });
  };

  if (isInitialLoading) {
    return (
      <Modal show={props.showDialog} onHide={props.onClose}
        className="create-dialog"
        backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Reschedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Spinner />
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={props.showDialog} onHide={props.onClose}
      className="create-dialog" fullscreen="lg-down"
      backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Reschedule</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="secondary">
          { savedMeeting.status === MeetingStatus.CONFIRMED && (
            <div>Be aware that this action will remove the meeting, create a new one with the details 
            of this meeting and new time slots will be suggested. The participants will need 
            to provide their votes again.</div>
          )}
          { savedMeeting.status === MeetingStatus.PROPOSED && (
            <div>Be aware that this action will remove all the votes given so far. The participants will need 
            to provide their votes again.</div>
          )}
        </Alert>
        <Form>
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
          Reschedule
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RescheduleDialog;
