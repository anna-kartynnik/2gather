import React, { useState } from 'react';

import './App.less';

import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { withRouter } from 'react-router';

import PageLayout from './components/layout/PageLayout';
import Agenda from './components/pages/Agenda/Agenda';
import Pending from './components/pages/Pending/Pending';
import MeetingDetails from './components/pages/MeetingDetails/MeetingDetails';
import Login from './components/pages/Login/Login';
import Profile from './components/pages/Profile/Profile';
import Toast from './components/Toast/Toast';
import CalendarsDialog from './components/CalendarsDialog/CalendarsDialog';

import useToken from './hooks/useToken';
import useUserProfile from './hooks/useUserProfile';
import {MeetingStatus} from './services/aws/meetings';


function App(props) {
  const { token, setToken } = useToken();
  const { userProfile, setUserProfile, deleteUserProfile } = useUserProfile();
  const [redirectTo, setRedirectTo] = useState(null);
  const [toastText, setToastText] = useState(null);
  const [toastBg, setToastBg] = useState('toast');
  const [toastPosition, setToastPosition] = useState(null);

  const location = useLocation();

  console.log(token);
  console.log(userProfile);

  const showToast = (text, background, position) => {
    setToastText(text ?? 'An error occurred');
    setToastBg(background ?? 'toast');
    setToastPosition(position ?? 'bottom-center');
  };

  const closeToast = () => {
    setToastText(null);
  };

  if (!token || !userProfile || !userProfile.googleUserProfile || !userProfile.awsUserProfile) {
    return (
      <Login
        setToken={setToken}
        setUserProfile={setUserProfile}
        setRedirectTo={setRedirectTo}
        showToast={showToast}
      />
    );
  }

  if (redirectTo !== null) {
    setRedirectTo(null);
    return (
      <Redirect to={redirectTo || location.pathname} />
    );
  }

  return (
    <PageLayout
      setToken={setToken}
      userProfile={userProfile}
      deleteUserProfile={deleteUserProfile}>
      <div className="page-content">

        <Switch>
          <Route path='/' exact>
            <Agenda
              userProfile={userProfile}
              showToast={showToast}
            />
          </Route>
          <Route path='/pending'>
            <Pending
              userProfile={userProfile}
              showToast={showToast}
            />
          </Route>
          <Route path='/created'>
            <Agenda
              status={MeetingStatus.CREATED}
              userProfile={userProfile}
              showToast={showToast}
            />
          </Route>
          <Route path='/profile'>
            <Profile
              userProfile={userProfile}
              showToast={showToast}
            />
          </Route>
          <Route path='/meetings/:id'>
            <MeetingDetailsWithRouter
              userProfile={userProfile}
              showToast={showToast}
            />
          </Route>
        
        </Switch>
      </div>
      <CalendarsDialog
        userProfile={userProfile}
        showToast={showToast}
      />
      { toastText &&
        <Toast text={toastText} bg={toastBg} 
          position={toastPosition} delay={5000}
          onClose={closeToast}
        />
      }
    </PageLayout>
  );
}

const MeetingDetailsWithRouter = withRouter(MeetingDetails);

export default App;
