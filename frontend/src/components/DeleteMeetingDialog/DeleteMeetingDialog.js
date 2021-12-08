import { useState } from 'react';

import './DeleteMeetingDialog.scss';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import Spinner from './../Spinner/Spinner';

import { deleteMeeting } from './../../services/aws/meetings';


function DeleteMeetingDialog(props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    deleteMeeting(props.meeting.id).then((resp) => {
      setIsLoading(false);
      props.showToast(
        'Your meeting has been successfully deleted.'
      );
      props.onCloseAndRefresh();
    }).catch((err) => {
      setIsLoading(false);
      props.showToast(
        err?.message,
        'danger',
        //'top-center'
      );
    });
  };

  return (
    <Modal show={props.showDialog} onHide={props.onClose}
      className="delete-dialog" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Delete confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          Are you sure you want to delete {props.meeting.name}?
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
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteMeetingDialog;
