import React, { useState } from 'react';

import './AgendaListItem.scss';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';

import AgendaListItemPills from './AgendaListItemPills';
import {
  AgendaListItemCreatorActions,
  AgendaListItemParticipantActions
} from './AgendaListItemActions';


function AgendaListItem(props) {

  return (
    <Row className={'agenda-list-item ' + (props.item.is_confirmed ? '' : 'not-confirmed')}>
      <Col className='title-container' sm={6}>
        <Link to={`/meetings/${props.item.id}`}>
          <div className='title'>
            { props.item.title }
            &nbsp;
            { props.item.proposed_option_number &&
              <Badge pill bg='warning' className='option-pill'>
                option {props.item.proposed_option_number} of {props.item.proposed_options_total}
              </Badge>
            }
          </div>
        </Link>
        <div className='note'>{ props.item.note }</div>
      </Col>
      <Col sm={4}>
        <AgendaListItemPills
          pills={props.item.pills}
        />
      </Col>
      <Col sm={2}>
        {/* [TODO] if current user === creator */}
        { props.item.is_creator && <AgendaListItemCreatorActions /> }
        { !props.item.is_creator &&
          <AgendaListItemParticipantActions
            item={props.item}
          />
        }
      </Col>
    </Row>
  );
}

export default AgendaListItem;
