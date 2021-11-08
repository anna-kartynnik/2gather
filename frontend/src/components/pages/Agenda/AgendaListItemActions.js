import React, { useState } from 'react';

import './AgendaListItemActions.scss';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';

import editIcon from './../../../images/pencil.svg';
import rescheduleIcon from './../../../images/reschedule.svg';
import deleteIcon from './../../../images/delete.svg';


function AgendaListItemActions(props) {

  return (
    <Stack direction='horizontal' className='agenda-list-item-actions'>
      <Button variant='link' title='Edit'>
        <img src={editIcon} alt='Edit' />
      </Button>
      <Button variant='link' title='Reschedule'>
        <img src={rescheduleIcon} alt='Reschedule' />
      </Button>
      <Button variant='link' title='Delete'>
        <img src={deleteIcon} alt='Delete' />
      </Button>
    </Stack>
  );
}

export default AgendaListItemActions;
