import React from 'react';

import './Login.scss';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { useGoogleLogin } from 'react-google-login';
import { refreshTokenSetup } from './../../../services/utils/tokenUtils';
import { loginToAWS, refreshAWSToken } from './../../../services/aws/login';
import { getUser, createUser } from './../../../services/aws/users';
import { getUserProfile } from './../../../services/google/users';

import logo from './../../../images/logo192.png';

const CLIENT_ID = '510174098853-s214e0rlu9ihecnop3liep462q54euvv.apps.googleusercontent.com';


function Login(props) {

  const onSuccess = (resp) => {
    console.log('success');
    console.log(resp);
    props.setToken(resp.tokenObj);

    let userEmail = '';
    let redirectTo = '/';

    refreshTokenSetup(resp, props.setToken/*, refreshAWSToken*/);
    refreshAWSToken(resp.id_token);
    loginToAWS(resp.tokenObj).then(() => {
      console.log('aws login ok');
      return getUserProfile();
    }).then((googleUserResponse) => {
      userEmail = googleUserResponse.data.email;
      props.setUserProfile.setGoogleUserProfile(googleUserResponse.data);
      return getUser(userEmail);
    }).then((awsUserResponse) => {
      console.log(awsUserResponse);
      props.setUserProfile.setAWSUserProfile(awsUserResponse.data);
    }).catch((err) => {
      console.log(err);
      if (err.status === 400 && err.data.message &&
        err.data.message === 'User not found') {
        console.log('creating user');
        redirectTo = '/profile';
        return createUser(userEmail).then((awsUserResponse) => {
          console.log(awsUserResponse);
          props.setUserProfile.setAWSUserProfile(awsUserResponse.data);
        }).catch((err2) => {
          console.log(err2);
        });
      } else {
        console.log(err);
        props.showToast(err?.message ?? 'An error occurred');
      }
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
    <div className="login-page">
      <div className="right-bottom-polygon"></div>
      <div className="right-top-polygon"></div>
      <div className="left-top-polygon"></div>
      <div className="left-bottom-polygon"></div>
      <Container className="login-page-container">
        <Row className="justify-content-center">
          <img src={logo} alt="logo" className="logo"/>
        </Row>
        <Row className="justify-content-center">
          <h1 className="logo-text">2gather</h1>
        </Row>
        <Row className="justify-content-center login-button">
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