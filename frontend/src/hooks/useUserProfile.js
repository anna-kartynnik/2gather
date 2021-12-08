import { useState } from 'react';
import { getUserProfile, saveUserProfile, deleteUserProfile as deleteUserProfileFromStorage } from './../services/utils/userUtils';


export default function useUserProfile() {
  const savedProfile = getUserProfile();
  const [googleUserProfile, setGoogleUserProfile] = useState(savedProfile ? savedProfile.google : null);
  const [awsUserProfile, setAWSUserProfile] = useState(savedProfile ? savedProfile.aws : null);

  const userProfile = {
    googleUserProfile,
    awsUserProfile
  };

  const saveGoogleUserProfile = (profile) => {
    setGoogleUserProfile(profile);
    saveUserProfile(profile, null);
  };

  const saveAWSUserProfile = (profile) => {
    setAWSUserProfile(profile);
    saveUserProfile(null, profile);
  };

  const setUserProfile = {
    setGoogleUserProfile: saveGoogleUserProfile,
    setAWSUserProfile: saveAWSUserProfile
  };

  const deleteUserProfile = () => {
    setGoogleUserProfile(null);
    setAWSUserProfile(null);
    deleteUserProfileFromStorage();
  };

  return {
    userProfile,
    setUserProfile,
    deleteUserProfile
  };



  // const [googleUserProfile, setGoogleUserProfile] = useState(null);
  // const [awsUserProfile, setAWSUserProfile] = useState(null);
  // // [TODO] save in localStorage?

  // const userProfile = {
  //   googleUserProfile,
  //   awsUserProfile
  // };
  // const setUserProfile = {
  //   setGoogleUserProfile,
  //   setAWSUserProfile
  // };

  // return {
  //   setUserProfile,
  //   userProfile
  // };
}