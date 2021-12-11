import React, { useState, useEffect } from 'react';

import './MeetingQuestionList.scss';

import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';

import QuestionList from './QuestionList';
import Spinner from './../Spinner/Spinner';
import CreateQuestionDialog from './../CreateQuestionDialog/CreateQuestionDialog';
import DeleteQuestionDialog from './../DeleteQuestionDialog/DeleteQuestionDialog';

import plusIcon from './../../images/plus.svg';

import { getQuestions } from './../../services/aws/meetings';


function MeetingQuestionList(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [listItems, setListItems] = useState([]);
  const [refresh, setRefresh] = useState(new Date().getTime());
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const { userProfile, meetingId, showToast } = props;

  useEffect(() => {
    setIsLoading(true);
    setListItems([]);
    getQuestions(meetingId, userProfile.awsUserProfile.id).then((resp) => {
      console.log(resp);
      setIsLoading(false);
      setListItems(resp.data);
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
      showToast(
        err?.message,
        'danger'
      );
    });

  }, [meetingId, refresh]);

  const handleCreateClick = () => {
    setShowCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
  };

  const handleCreateDialogCloseAndRefresh = () => {
    setShowCreateDialog(false);
    setRefresh(new Date().getTime());
  };

  const handleDelete = (meeting) => () => {
    setQuestionToDelete(meeting);
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setQuestionToDelete(null);
  };

  const handleDeleteDialogCloseAndRefresh = () => {
    setShowDeleteDialog(false);
    setRefresh(new Date().getTime());
    setQuestionToDelete(null);
  };

  const handleRefresh = () => {
    setRefresh(new Date().getTime());
  }

  return (
    <div className="questions-list my-3">
      <Stack direction="horizontal" gap={2} className="my-2">
        <h4 className="my-1">Questions</h4>
        <Button variant="secondary"
          className="add-question"
          onClick={handleCreateClick}>
          <img src={plusIcon} alt="add question" className="plus" />
        </Button>
      </Stack>
      { isLoading && <Spinner /> }
      <QuestionList
        meetingId={meetingId}
        listItems={listItems}
        userProfile={props.userProfile}
        showToast={props.showToast}
        handleDelete={handleDelete}
        handleRefresh={handleRefresh}
      />
      { showCreateDialog &&
        <CreateQuestionDialog
          showDialog={showCreateDialog}
          onClose={handleCloseCreateDialog}
          onCloseAndRefresh={handleCreateDialogCloseAndRefresh}
          showToast={props.showToast}
          userProfile={props.userProfile}
          meetingId={meetingId}
        />
      }
      { showDeleteDialog &&
        <DeleteQuestionDialog
          showDialog={showDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onCloseAndRefresh={handleDeleteDialogCloseAndRefresh}
          showToast={props.showToast}
          question={questionToDelete}
          meetingId={meetingId}
        />
      }
    </div>
  );
}

export default MeetingQuestionList;
