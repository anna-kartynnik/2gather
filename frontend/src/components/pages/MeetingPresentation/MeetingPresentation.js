import React, { useState, useEffect } from 'react';

import './MeetingPresentation.scss';

import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';

import Spinner from './../../Spinner/Spinner';
import closeIcon from './../../../images/close.svg';
import rightArrowIcon from './../../../images/right-arrow.svg';

import { getMeetingById, getQuestions } from './../../../services/aws/meetings';


function MeetingPresentation(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [meeting, setMeeting] = useState(null);
  const [questions, setQuestions] = useState([]);

  const { userProfile, showToast } = props;
  const meetingId = props.match.params.id;
  const questionId = props.match.params.question_id;

  useEffect(() => {
    setIsLoading(true);
    getMeetingById(meetingId, userProfile.awsUserProfile.id).then((resp) => {
      console.log(resp);
      setMeeting(resp.data);
      return getQuestions(meetingId, userProfile.awsUserProfile.id);
    }).then((resp) => {
      console.log(resp);
      const questionList = resp.data.sort((q) => -q.number_of_votes);
      const limitedQuestionList = [];
      let selectedIndex = questionList.findIndex((q) => q.id === questionId);
      console.log(selectedIndex);
      if (selectedIndex === -1) {
        selectedIndex = 0;
      }
      for (let index = selectedIndex; index < questionList.length; index++) {
        limitedQuestionList.push(questionList[index]);
      }
      setQuestions(limitedQuestionList);
      setIsLoading(false);
    }).catch((err) => {
      console.log(err);
      showToast(err?.message, 'danger');
      setIsLoading(false);
    });
  }, [meetingId, questionId]);

  if (isLoading) {
    return (
      <div className="meeting-presentation-container spinner">
        <Spinner />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div>There are no questions for this meeting.</div>
    );
  }

  return (
    <div className="meeting-presentation-container">
      <Stack direction="horizontal">
        <span className="title">{meeting.name} - Questions</span>
        <Link to={`/meetings/${meetingId}`}>
          <img src={closeIcon} alt="Close" />
        </Link>
      </Stack>
      <div className="mb-3"></div>
      <Stack direction="vertical" gap={2}>
        { questions.map((question, index) => (
          <Row className="g-0 py-4 px-4 question-list-item">
            <Col sm={11} className="ms-auto">
              {question.question_text}
            </Col>
            <Col sm={1}>
              { questions.length > 1 && index === 0 &&
                <Link to={`/meetings/${meetingId}/present/${questions[index + 1].id}`}>
                  <img src={rightArrowIcon} alt="Next" />
                </Link>
              }
            </Col>
          </Row>
        )) }
      </Stack>
    </div>
  );
}

export default MeetingPresentation;
