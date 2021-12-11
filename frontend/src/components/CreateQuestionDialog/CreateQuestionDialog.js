import { useState } from 'react';

import './../scss/CreateDialog.scss';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import Spinner from './../Spinner/Spinner';

import { addQuestion } from './../../services/aws/meetings';


function CreateQuestionDialog(props) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invalid, setInvalid] = useState({});

  const handleTextChange = (evt) => {
    setText(evt.target.value);
  };

  const validateForm = () => {
    const invalidCollection = {};
    let isFormValid = true;
    if (!text) {
      invalidCollection['text'] = 'Question text is required';
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
    addQuestion({
      text,
      id: props.meetingId,
      user_id: props.userProfile.awsUserProfile.id
    }).then((resp) => {
      setIsLoading(false);
      props.showToast(
        'The question has been successfully created.',
        'toast'
      );
      props.onCloseAndRefresh();
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
      props.showToast(
        err?.message,
        'danger'
      );
    });
  };

  return (
    <Modal show={props.showDialog} onHide={props.onClose}
      className="create-dialog" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add new question</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Control as="textarea"
              rows={3}
              placeholder="Enter a question text"
              value={text}
              onChange={handleTextChange}
            />
            { invalid['text'] &&
              <div className="invalid">
                { invalid['text'] }
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
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateQuestionDialog;
