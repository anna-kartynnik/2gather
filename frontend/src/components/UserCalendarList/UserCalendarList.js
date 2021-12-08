import React, { useEffect, useState } from 'react';

import './UserCalendarList.scss';

import Stack from 'react-bootstrap/Stack';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from './../Spinner/Spinner';

import shareIcon from './../../images/share.svg';

import { getUserCalendarList, givePermissionsToCalendar } from './../../services/google/users';
import { saveCalendar as saveCalendarToAWS } from './../../services/aws/calendars';

function UserCalendarList(props) {
  const [calendars, setCalendars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sharingCalendarId, setSharingCalendarId] = useState(null);

  const { showToast } = props;

  useEffect(() => {
    getUserCalendarList().then((resp) => {
      setIsLoading(false);
      setCalendars(resp.data.items);
      console.log(resp);
    }).catch((err) => {
      setIsLoading(false);
      showToast(
        err?.message,
        'danger'
      );
    });
  }, [/*showToast*/]);

  const shareCalendar = (calendarId) => () => {
    console.log(calendarId);
    setSharingCalendarId(calendarId);
    //props.closeToast();
    givePermissionsToCalendar(calendarId).then((resp) => {
      console.log(resp);
      return saveCalendarToAWS(props.userProfile.awsUserProfile.id, calendarId);
    }).then((resp) => {
      setSharingCalendarId(null);
      console.log(resp);
      props.refresh && props.refresh(resp.data);
      props.showToast('Thank you for sharing your calendar!', 'toast');
    }).catch((err) => {
      setSharingCalendarId(null);
      console.log(err);
      props.showToast(err?.message, 'danger');
    });
  };

  return (
    <div>
      { props.showTitle && <h3>My calendars</h3> }
      <Alert variant="secondary">
        Please share at least one calendar with us. 
        It will let our application to suggest you more appropriate time slots for your meetings.
      </Alert>
      { isLoading && <Spinner /> }
      <Stack direction="vertical" gap={3} className="calendar-list">
        { calendars.map(
          (calendar) => (
            <Row key={calendar.id} className="calendar-item align-items-center gx-0">
              {/*<Col xs="auto" className="calendar-color" style={{backgroundColor: calendar.backgroundColor}}>
              </Col>*/}
              <Col md={8}>
                <div className="calendar-title">{calendar.summary}</div>
                <div className="calendar-description">{calendar.description}</div>
              </Col>
              <Col md={4} className="actions text-end">
                { sharingCalendarId && sharingCalendarId === calendar.id && <Spinner /> }
                { (!sharingCalendarId || sharingCalendarId !== calendar.id) &&
                  <Button variant="link" onClick={shareCalendar(calendar.id)} title="Share this calendar">
                    <img src={shareIcon} alt="Share calendar"/>
                  </Button>
                }
              </Col>
            </Row>
          )
        ) }
      </Stack>
    </div>
  );
}

export default UserCalendarList;
