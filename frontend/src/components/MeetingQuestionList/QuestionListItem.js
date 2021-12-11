import React from 'react';

import './QuestionListItem.scss';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';

import QuestionListItemActions from './QuestionListItemActions';


function QuestionListItem(props) {
  return (
    <Row className={"g-0 py-3 px-4 question-list-item"}>
      <Col sm={9}>
        <div className="text">{ props.item.question_text }</div>
      </Col>
      <Col sm={3}>
        <QuestionListItemActions
          {...props}
          currentUserId={props.userProfile.awsUserProfile.id}
          voteId={props.item.vote_id}
        />
      </Col>
    </Row>
  );
}

export default QuestionListItem;
