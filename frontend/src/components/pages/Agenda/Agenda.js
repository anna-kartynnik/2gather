import React, { useState, useEffect } from 'react';

import Button from 'react-bootstrap/Button';

import SwitchElement from './../../SwitchElement/SwitchElement';
import AgendaList from './AgendaList';
import PageActions from './../../PageActions/PageActions';
import PageTabs from './../../PageTabs/PageTabs';
import CreateMeetingDialog from './../../CreateMeetingDialog/CreateMeetingDialog';
import EditMeetingDialog from './../../EditMeetingDialog/EditMeetingDialog';
import DeleteMeetingDialog from './../../DeleteMeetingDialog/DeleteMeetingDialog';
import ConfirmMeetingTimeDialog from './../../ConfirmMeetingTimeDialog/ConfirmMeetingTimeDialog';
import RescheduleDialog from './../../RescheduleDialog/RescheduleDialog';

import { getAgendaList, getConfirmedAgendaList, MeetingStatus } from './../../../services/aws/meetings';


function Agenda(props) {
  const [isConfirmedOnly, setIsConfirmedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [listItems, setListItems] = useState([]);
  const [refresh, setRefresh] = useState(new Date().getTime());
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [meetingToEdit, setMeetingToEdit] = useState(null);
  const [meetingToConfirm, setMeetingToConfirm] = useState(null);
  const [meetingToReschedule, setMeetingToReschedule] = useState(null);

  const { userProfile, status, showToast } = props;

  useEffect(() => {
    setIsLoading(true);
    setListItems([]);
    const getFunc = isConfirmedOnly ? getConfirmedAgendaList : getAgendaList;
    getFunc(userProfile.awsUserProfile, status).then((items) => {
      console.log(items);
      setIsLoading(false);
      setListItems(items);
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
      showToast(
        err?.message,
        'danger'
      );
    });

  }, [isConfirmedOnly, refresh, status/*, userProfile, showToast*/]);

  const handleConfirmedOnlyChange = (evt) => {
    setIsConfirmedOnly(evt.target.checked);
  };

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
    setMeetingToDelete(meeting);
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setMeetingToDelete(null);
  };

  const handleDeleteDialogCloseAndRefresh = () => {
    setShowDeleteDialog(false);
    setRefresh(new Date().getTime());
    setMeetingToDelete(null);
  };

  const handleEdit = (meeting) => () => {
    setMeetingToEdit(meeting);
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setMeetingToEdit(null);
  };

  const handleEditDialogCloseAndRefresh = () => {
    setShowEditDialog(false);
    setRefresh(new Date().getTime());
    setMeetingToEdit(null);
  };

  const handleConfirm = (meeting) => () => {
    setMeetingToConfirm(meeting);
    setShowConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
    setMeetingToConfirm(null);
  };

  const handleConfirmDialogCloseAndRefresh = () => {
    setShowConfirmDialog(false);
    setRefresh(new Date().getTime());
    setMeetingToConfirm(null);
  };

  const handleReschedule = (meeting) => () => {
    setMeetingToReschedule(meeting);
    setShowRescheduleDialog(true);
  };

  const handleCloseRescheduleDialog = () => {
    setShowRescheduleDialog(false);
    setMeetingToReschedule(null);
  };

  const handleRescheduleDialogCloseAndRefresh = () => {
    setShowRescheduleDialog(false);
    setRefresh(new Date().getTime());
    setMeetingToReschedule(null);
  };

  const handleRefresh = () => {
    setRefresh(new Date().getTime());
  }

  return (
    <>
      <PageActions
        buttonComponent={
          <Button variant='primary' size='lg'
            onClick={handleCreateClick}>
            Create
          </Button>
        }
      />
      <PageTabs />
      <div className='m-3'></div>
      { props.status !== MeetingStatus.CREATED &&
        <SwitchElement
          isConfirmedOnly={isConfirmedOnly}
          onConfirmedOnlyChange={handleConfirmedOnlyChange}
        />
      }
      <div className='m-3'></div>
      <AgendaList
        status={props.status}
        isLoading={isLoading}
        listItems={listItems}
        showToast={props.showToast}
        userProfile={props.userProfile}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        handleConfirm={handleConfirm}
        handleReschedule={handleReschedule}
        handleRefresh={handleRefresh}
      />
      { showCreateDialog &&
        <CreateMeetingDialog
          showDialog={showCreateDialog}
          onClose={handleCloseCreateDialog}
          onCloseAndRefresh={handleCreateDialogCloseAndRefresh}
          showToast={props.showToast}
          userProfile={props.userProfile}
        />
      }
      { showEditDialog &&
        <EditMeetingDialog
          showDialog={showEditDialog}
          onClose={handleCloseEditDialog}
          onCloseAndRefresh={handleEditDialogCloseAndRefresh}
          showToast={props.showToast}
          meetingId={meetingToEdit.id}
          userProfile={props.userProfile}
        />
      }
      { showConfirmDialog &&
        <ConfirmMeetingTimeDialog
          showDialog={showConfirmDialog}
          onClose={handleCloseConfirmDialog}
          onCloseAndRefresh={handleConfirmDialogCloseAndRefresh}
          showToast={props.showToast}
          meeting={meetingToConfirm}
          userProfile={props.userProfile}
        />
      }
      { showRescheduleDialog &&
        <RescheduleDialog
          showDialog={showRescheduleDialog}
          onClose={handleCloseRescheduleDialog}
          onCloseAndRefresh={handleRescheduleDialogCloseAndRefresh}
          showToast={props.showToast}
          meetingId={meetingToReschedule.id}
          userId={props.userProfile.awsUserProfile.id}
        />
      }
      { showDeleteDialog &&
        <DeleteMeetingDialog
          showDialog={showDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onCloseAndRefresh={handleDeleteDialogCloseAndRefresh}
          showToast={props.showToast}
          meeting={meetingToDelete}
        />
      }
    </>
  );
}

export default Agenda;
