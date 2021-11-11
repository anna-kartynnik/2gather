import React, { useState } from 'react';

import './AgendaListItemActions.scss';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';

import editIcon from './../../../images/pencil.svg';
import rescheduleIcon from './../../../images/reschedule.svg';
import deleteIcon from './../../../images/delete.svg';
import calendarIcon from './../../../images/calendar.svg';
import calendarAcceptedIcon from './../../../images/calendar_accepted.svg';


export function AgendaListItemCreatorActions(props) {

  return (
    <Stack direction='horizontal' className='agenda-list-item-actions'>
      <Button variant='link' title='Edit'>
        <img src={editIcon} alt='Edit' />
      </Button>
      <Button variant='link' title='Reschedule'>
        <img src={rescheduleIcon} alt='Reschedule' />
      </Button>
      <Button variant='link' title='Delete' className='ms-auto'>
        <img src={deleteIcon} alt='Delete' />
      </Button>
    </Stack>
  );
}

export function AgendaListItemParticipantActions(props) {

  return (
    <Stack direction='horizontal' className='agenda-list-item-actions'>
      { !props.item.proposed_option_accepted &&
        <Button variant='link' title='Accept time' className='ms-auto'>
          <img src={calendarIcon} alt='Accept time' />
        </Button>
      }
      { props.item.proposed_option_accepted &&
        <Button variant='link' title='Reject time' className='ms-auto'>
          <img src={calendarAcceptedIcon} alt='Reject time' />
        </Button>
      }
    </Stack>
  );
}
