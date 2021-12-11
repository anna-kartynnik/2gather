import { useState } from 'react';

import './ConfirmMeetingTimeDialog.scss';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';

import Spinner from './../Spinner/Spinner';

import moment from 'moment';

import { confirmMeeting } from './../../services/aws/meetings';


function ConfirmMeetingTimeDialog(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [validationError, setValidationError] = useState(null);

  console.log(props.meeting);

  const handleSelectedTimeChange = (evt) => {
    console.log(evt.target);
    setSelectedTime(evt.target.value);
  };

  const handleSubmit = () => {
    if (isLoading) {
      return;
    }

    if (!selectedTime) {
      setValidationError('Please choose a time slot');
      return;
    }

    setIsLoading(true);
    confirmMeeting({
      id: props.meeting.id,
      confirmed_time: selectedTime
    }).then((resp) => {
      setIsLoading(false);
      props.showToast(
        'Your meeting has been successfully confirmed.'
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

  return (
    <Modal show={props.showDialog} onHide={props.onClose}
      className="confirm-time-dialog" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Confirm meeting time</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          What time do you want to confirm for your meeting?
          <br/><br/>
          {
            props.meeting.proposed_times.map((pt, index) => (
              <div key={pt.meeting_proposed_time_id}>
                <Form.Check
                  inline
                  type="radio"
                  id={`proposed-time-checkbox-${index}`}
                  name="proposed-time-checkbox"
                  label={moment(pt.proposed_time).format('MMM, D [at] h:mma')}
                  value={pt.proposed_time}
                  onChange={handleSelectedTimeChange}
                />
                <Badge pill bg="success" className="votes">
                  { pt.number_of_votes }
                </Badge>
              </div>
            ))
          }
          <br/>
          { validationError &&
            <div className="error">{ validationError }</div>
          }
        </div>
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
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmMeetingTimeDialog;
