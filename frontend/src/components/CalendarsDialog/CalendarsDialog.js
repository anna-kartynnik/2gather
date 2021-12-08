import { useState, useEffect } from 'react';


import Modal from 'react-bootstrap/Modal';

import UserCalendarList from './../UserCalendarList/UserCalendarList';

import { getCalendarList } from './../../services/aws/calendars';


function CalendarsDialog(props) {
  const [savedCalendars, setSavedCalendars] = useState([]);

  const { userProfile, showToast } = props;

  useEffect(() => {
    getCalendarList(userProfile.awsUserProfile.id).then((response) => {
      console.log(response);
      setSavedCalendars(response.data);
    }).catch((err) => {
      console.log(err);
      showToast(err?.message, 'danger');
    });
  }, []);

  const handleRefresh = (data) => {
    const newCalendars = savedCalendars;
    newCalendars.push(data);
    setSavedCalendars(newCalendars);
  };

  if (savedCalendars.length > 0) {
    return null;
  }

  return (
    <Modal show={true}
      className="create-dialog" fullscreen="lg-down"
      backdrop="static">
      <Modal.Header>
        <Modal.Title>Calendars</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <UserCalendarList
          userProfile={props.userProfile}
          showToast={props.showToast}
          refresh={handleRefresh}
        />
      </Modal.Body>
    </Modal>
  );
}

export default CalendarsDialog;
