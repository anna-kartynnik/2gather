import React from 'react';

import './LogoutAction.scss';

import { useGoogleLogout } from 'react-google-login';
import { deleteUserProfile } from './../../services/utils/userUtils';
import { deleteToken } from './../../services/utils/tokenUtils';

import logout from './../../images/logout.svg';


const CLIENT_ID = '510174098853-s214e0rlu9ihecnop3liep462q54euvv.apps.googleusercontent.com';

function LogoutAction(props) {
  const onLogoutSuccess = (resp) => {
  	console.log('logout successful');
    //props.setToken({});
    //deleteToken();
    deleteUserProfile();
    props.setToken({});
  };

  const onFailure = (resp) => {
    console.log('logout failure');
    console.log(resp);
  };

  const { signOut } = useGoogleLogout({
  	CLIENT_ID,
  	onLogoutSuccess,
  	onFailure,
  });

  return (
    <img src={logout} alt="log out" onClick={signOut} className="logout-action" title="Log out" />
  );
}

export default LogoutAction;