import { useState } from 'react';


export default function useUserProfile() {
  const [userProfile, setUserProfile] = useState(null);

  return {
    setUserProfile,
    userProfile
  };
}