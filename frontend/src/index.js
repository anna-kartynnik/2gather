import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
//import reportWebVitals from './reportWebVitals';

// Importing the Bootstrap CSS
import './custom.scss';
//import 'bootstrap/dist/css/bootstrap.min.css';

import { getAPIGatewaySDK } from './services/aws/sdkUtil';
import { getIdToken } from './services/utils/tokenUtils';

function renderApp() {
  ReactDOM.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById('root')
  );
}

const idToken = getIdToken();
if (idToken) {
  getAPIGatewaySDK()
    .then(() => console.log('successfully initialized AWS SDK'))
    .catch((err) => console.log('error when initializing AWS SDK', err))
    .finally(renderApp);
} else {
  renderApp();
}

// ReactDOM.render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>,
//   document.getElementById('root')
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
