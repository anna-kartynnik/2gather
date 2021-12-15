import React from 'react';

import './AgendaListItem.scss';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';

import AgendaListItemPills from './AgendaListItemPills';
import {
  MeetingListItemCreatorActions,
  MeetingListItemParticipantActions
} from './../../MeetingActions/MeetingActions';


function AgendaListItem(props) {
  return (
    <Row className={"g-0 py-3 px-4 agenda-list-item " + (props.item.is_confirmed ? "" : "not-confirmed")}>
      <Col className='title-container' sm={7}>
        <Link to={`/meetings/${props.item.id}`}>
          <div className='title'>
            { props.item.name }
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
      <Col sm={2}>
        <AgendaListItemPills
          pills={props.item.pills}
        />
      </Col>
      <Col sm={3}>
        {/* [TODO] if current user === creator */}
        { props.item.is_creator &&
          <MeetingListItemCreatorActions
            item={props.item}
            handleDelete={props.handleDelete}
            handleEdit={props.handleEdit}
            handleConfirm={props.handleConfirm}
            handleReschedule={props.handleReschedule}
          />
        }
        { !props.item.is_creator &&
          <MeetingListItemParticipantActions
            item={props.item}
          />
        }
      </Col>
    </Row>
  );
}

export default AgendaListItem;
