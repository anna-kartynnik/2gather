import React, { useState } from 'react';

import './PageLayout.scss';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import Logo from './../Logo/Logo';
import LogoutAction from './../LogoutAction/LogoutAction';
import { Link } from 'react-router-dom';

import Notifications from './../Notifications/Notifications';

import notif from './../../images/notification.svg';


function PageLayout(props) {
  const [refresh, setRefresh] = useState(null);

  return (
    <Container className="page-layout my-3">
      <Row className='header gy-5'>
        <Stack direction='horizontal' gap={3}>
          <Logo />
          <div className="user-avatar ms-auto">
            { props.userProfile && props.userProfile.googleUserProfile && props.userProfile.googleUserProfile.picture &&
              <Link to="/profile">
                <img src={props.userProfile.googleUserProfile.picture} alt="user avatar" title={props.userProfile.googleUserProfile.name} 
                  referrerPolicy='no-referrer'
                />
              </Link>
            }
          </div>
          {/*<div><img src={notif} alt='notifications' /></div>*/}
          { props.userProfile && props.userProfile.awsUserProfile &&
            <Notifications
              userProfile={props.userProfile}
              refresh={refresh}
            />
          }
          <div>
            <LogoutAction
              setToken={props.setToken}
              deleteUserProfile={props.deleteUserProfile}
            />
          </div>
        </Stack>
      </Row>
      { props.children }
      {/*</Row>
{/*      <Row className='footer'>
        Footer
      </Row>*/}
    </Container>
  );
}

export default PageLayout;
