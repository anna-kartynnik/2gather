import { useState } from 'react';

import './ConfirmMeetingTimeDialog.scss';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Spinner from './../Spinner/Spinner';

import moment from 'moment';

import { confirmMeeting } from './../../services/aws/meetings';


function ConfirmMeetingTimeDialog(props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    confirmMeeting({
      id: props.meeting.id,
      confirmed_time: props.meeting.proposed_time
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
          Do you want to confirm time&nbsp;
          <i>{moment(props.meeting.proposed_time).format('MMM, D [at] h:mma')}</i>
          &nbsp;for your meeting?
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
