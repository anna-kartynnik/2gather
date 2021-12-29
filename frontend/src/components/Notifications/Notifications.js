import { useEffect, useState } from 'react';

import './Notifications.scss';

import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Alert from 'react-bootstrap/Alert';

import Spinner from './../Spinner/Spinner';

import notif from './../../images/notification.svg';

import { getNotifications, updateNotifications } from './../../services/aws/notifications';


function Notifications(props) {
  const [refresh, setRefresh] = useState(new Date().getTime());
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getNotifications(props.userProfile.awsUserProfile.id).then((resp) => {
      console.log(resp);
      setNotifications(resp.data);
      setIsLoading(false);
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
    });
  }, [refresh]);



  const handleOpen = () => {
    updateNotifications(notifications.map((n) => n.id));
    // do not handle response.
    setTimeout(() => {
      setNotifications([]);
    }, 2000);
  };

  return (
    <div className="notifications-container">
      <DropdownButton
        disabled={notifications.length === 0}
        title={
          <NotificationsIcon
            count={notifications.length}
          />
        }
        onClick={handleOpen}
        align="end"
        id="dropdown-menu-align-end">
 
        { notifications.map((notification) =>
          <Dropdown.Item key={notification.id}>{notification.text}</Dropdown.Item>
        )}
      </DropdownButton>
    </div>
  );
}

function NotificationsIcon(props) {
  return (
    <div className="image-container">
      <img src={notif} alt="notifications"/>
      { props.count > 0 && <span>{props.count}</span> }
    </div>
  );
}

export default Notifications;