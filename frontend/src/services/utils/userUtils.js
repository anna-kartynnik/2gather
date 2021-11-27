const USER_PARAM_NAME = '2gather-user';

export function getUserProfile() {
  const userString = localStorage.getItem(USER_PARAM_NAME);
  console.log(userString);
  if (!userString) {
    return null;
  }
  const user = JSON.parse(userString);
  console.log(user);
  return user;
}

export function saveUserProfile(googleUserProfile, awsUserProfile) {
  const userProfile = getUserProfile() || {};
  if (googleUserProfile) {
    userProfile.google = googleUserProfile;
  }
  if (awsUserProfile) {
    userProfile.aws = awsUserProfile;
  }
  localStorage.setItem(USER_PARAM_NAME, JSON.stringify(userProfile));
};

export function deleteUserProfile() {
	localStorage.removeItem(USER_PARAM_NAME);
}