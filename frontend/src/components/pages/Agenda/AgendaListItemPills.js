import React, { useState } from 'react';

import './AgendaListItemPills.scss';
import Badge from 'react-bootstrap/Badge';
import Col from 'react-bootstrap/Col';


function AgendaListItemPills(props) {

  return (
    <div className='pills'>
      {
        props.pills.map(
          (pill, index) => <AgendaListItemPill key={index} pill={pill} />
        )
      }
    </div>
  );
}

export default AgendaListItemPills;

function AgendaListItemPill(props) {
  return (
    <Badge pill bg='light' text={props.pill.color} className={'pill ' + props.pill.color}>
      {props.pill.text}
    </Badge>
  );
}
