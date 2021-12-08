import React from 'react';

import './Profile.scss';

import UserCalendarList from './../../UserCalendarList/UserCalendarList';

function Profile(props) {

  return (
    <div>
      <UserCalendarList
        showTitle={true}
        userProfile={props.userProfile}
        showToast={props.showToast}
      />
    </div>
  );
}

export default Profile;
