import { useState } from 'react';

import { getToken, saveToken } from './../utils/tokenUtils';


export default function useToken() {
  const [token, setToken] = useState(getToken());

  const saveTokenToHook = userToken => {
    saveToken(userToken);
    setToken(userToken.access_token);
  };

  return {
    setToken: saveTokenToHook,
    token
  };
}