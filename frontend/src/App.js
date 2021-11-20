import React, { useState } from 'react';

import './App.less';

import { Switch, Route, Redirect, useLocation } from 'react-router-dom';

import PageLayout from './components/layout/PageLayout';
import Agenda from './components/pages/Agenda/Agenda';
import Pending from './components/pages/Pending/Pending';
import MeetingDetails from './components/pages/MeetingDetails/MeetingDetails';
import Login from './components/pages/Login/Login';
import Profile from './components/pages/Profile/Profile';
import Toast from './components/Toast/Toast';

import useToken from './hooks/useToken';
import useUserProfile from './hooks/useUserProfile';


function App(props) {
  const { token, setToken } = useToken();
  const { userProfile, setUserProfile } = useUserProfile();
  const [redirectTo, setRedirectTo] = useState(false);
  const [toastText, setToastText] = useState(null);
  const [toastBg, setToastBg] = useState('success');

  const location = useLocation();

  if (!token) {
    return (
      <Login setToken={setToken} setRedirectTo={setRedirectTo} />
    );
  }

  if (redirectTo) {
    setRedirectTo(false);
    return (
      <Redirect to={location.pathname} />
    );
  }

  const showToast = (text, background) => {
    setToastText(text ?? 'An error occurred');
    setToastBg(background);
  };

  const closeToast = () => {
    setToastText(null);
  };

  return (
    <PageLayout
      setToken={setToken}
      userProfile={userProfile}
      setUserProfile={setUserProfile}>
      <div className='page-content'>
        <Switch>
          <Route path='/' exact>
            <Agenda />
          </Route>
          <Route path='/pending'>
            <Pending />
          </Route>
          <Route path='/profile'>
            <Profile
              userProfile={userProfile}
              showToast={showToast}
              closeToast={closeToast}
            />
          </Route>
          <Route path='/meetings/:id'>
            <MeetingDetails />
          </Route>
        
        </Switch>
      </div>
      { toastText &&
        <Toast text={toastText} bg={toastBg} delay={5000} onClose={closeToast}/>
      }
    </PageLayout>
  );
}

export default App;

function Todo() {
  return (
    <div>Pending</div>
  );
}
