import React from 'react';

import './Login.scss';


import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useGoogleLogin } from 'react-google-login';
import { refreshTokenSetup } from './../../../utils/tokenUtils';
import { loginToAWS, refreshAWSToken } from './../../../services/aws/login';

import logo from './../../../images/logo192.png';

const CLIENT_ID = '510174098853-s214e0rlu9ihecnop3liep462q54euvv.apps.googleusercontent.com';


function Login(props) {

  const onSuccess = (resp) => {
    console.log('success');
    console.log(resp);
    props.setToken(resp.tokenObj);

    refreshTokenSetup(resp, props.setToken, refreshAWSToken);
    loginToAWS(resp.tokenObj).then(() => {
      console.log('aws login ok');
      props.setRedirectTo(true);
    }).catch((err) => {
      console.log(err);
    });

  };

  const onFailure = (resp) => {
    console.log('failure');
    console.log(resp);
  };

  const { signIn } = useGoogleLogin({
    onSuccess,
    onFailure,
    CLIENT_ID,
    isSignedIn: true,
    accessType: 'offline',
    scope: 'profile email https://www.googleapis.com/auth/calendar.calendarlist https://www.googleapis.com/auth/calendar',
  });

  return (
    <div className='login-page'>
      <div className='left-top-polygon'></div>
      <div className='right-top-polygon'></div>
      <div className='left-bottom-polygon'></div>
      <div className='right-bottom-polygon'></div>
      <Container className='login-page-container'>
        <Row className='justify-content-center'>
          <img src={logo} alt="logo" className="logo"/>
        </Row>
        <Row className='justify-content-center'>
          <h1 className='logo-text'>2gather</h1>
        </Row>
        <Row className='justify-content-center login-button'>
          {/*<div className="g-signin2" data-onsuccess="onSignIn"></div>*/}
          <Button
            variant="secondary"
            onClick={signIn}>
            Login with Google
          </Button>
        </Row>
      </Container>
    </div>
  );
}

export default Login;