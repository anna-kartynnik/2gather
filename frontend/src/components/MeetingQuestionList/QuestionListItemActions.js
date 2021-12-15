import React, { useState } from 'react';

import './QuestionListItemActions.scss';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Spinner from './../Spinner/Spinner';

import thumbUpGrayIcon from './../../images/thumb-up-gray.svg';
import thumbUpIcon from './../../images/thumb-up.svg';
import deleteIcon from './../../images/delete.svg';

import { saveQuestionVote } from './../../services/aws/meetings';


export default function QuestionListItemActions(props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = () => {
    saveQuestionVote(props.meetingId, props.item.id, props.currentUserId, props.voteId).then((resp) => {
      console.log(resp);
      setIsLoading(false);
      props.showToast('Thank you for your vote!');
      props.handleRefresh();
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
      props.showToast(
        err?.message ?? 'An error occurred',
        'danger'
      );
    });
  };

  const handleRemoveLike = () => {
    // TODO
    saveQuestionVote(props.meetingId, props.item.id, props.currentUserId, props.voteId).then((resp) => {
      console.log(resp);
      setIsLoading(false);
      props.showToast('Thank you for your vote!');
      props.handleRefresh();
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
      props.showToast(
        err?.message ?? 'An error occurred',
        'danger'
      );
    });
  };

  return (
    <Stack direction="horizontal" className="question-list-item-actions">
      { isLoading && <Spinner /> }
      { !isLoading && !props.voteId &&
        <Button variant="link" title="Like"
          className="ms-auto"
          onClick={handleLike}>
          <div className="like-container">
            <img src={thumbUpGrayIcon} alt="Like" />
            <Badge pill bg="success">{props.item.number_of_votes}</Badge>
          </div>
        </Button>
      }
      { !isLoading && props.voteId &&
        <Button variant="link" title="Remove like"
          className="ms-auto"
          onClick={handleRemoveLike}>
          <div className="like-container">
            <img src={thumbUpIcon} alt="Remove like" />
            <Badge pill bg="success">{props.item.number_of_votes}</Badge>
          </div>
        </Button>
      }
      <Button variant="link" title="Delete" onClick={props.handleDelete(props.item)}>
        <img src={deleteIcon} alt="Delete" />
      </Button>
    </Stack>
  );
}
