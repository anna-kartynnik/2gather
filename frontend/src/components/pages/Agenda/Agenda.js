import React, { useState, useEffect } from 'react';

import Button from 'react-bootstrap/Button';

import SwitchElement from './../../SwitchElement/SwitchElement';
import AgendaList from './AgendaList';
import Spinner from './../../Spinner/Spinner';
import PageActions from './../../PageActions/PageActions';
import PageTabs from './../../PageTabs/PageTabs';
import CreateMeetingDialog from './../../CreateMeetingDialog/CreateMeetingDialog';

import { getAgendaList, getConfirmedAgendaList } from './../../../services/aws/meetings';


function Agenda(props) {
  const [isConfirmedOnly, setIsConfirmedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [listItems, setListItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setListItems([]);
    const getFunc = isConfirmedOnly ? getConfirmedAgendaList : getAgendaList;
    getFunc().then((items) => {
      setIsLoading(false);
      setListItems(items);
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
      setError(err?.message || 'An error has occurred.');
    });

  }, [isConfirmedOnly]);

  const handleConfirmedOnlyChange = (evt) => {
    setIsConfirmedOnly(evt.target.checked);
  }

  const handleCreateClick = () => {
    setShowCreateDialog(true);
  }

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
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
      <SwitchElement
        isConfirmedOnly={isConfirmedOnly}
        onConfirmedOnlyChange={handleConfirmedOnlyChange}
      />
      <div className='m-3'></div>
      { isLoading &&
        <Spinner />
      }
      <AgendaList listItems={listItems} />
      { showCreateDialog &&
        <CreateMeetingDialog
          showDialog={showCreateDialog}
          onClose={handleCloseCreateDialog}
        />
      }
    </>
  );
}

export default Agenda;
