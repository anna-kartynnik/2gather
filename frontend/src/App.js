import React, { useState } from 'react';

import { Switch, Route, Link } from 'react-router-dom';

import PageLayout from './components/layout/PageLayout';
import PageActions from './components/PageActions/PageActions';
import PageTabs from './components/PageTabs/PageTabs';
import Agenda from './components/pages/Agenda/Agenda';
import Pending from './components/pages/Pending/Pending';
import MeetingDetails from './components/pages/MeetingDetails/MeetingDetails';

import './App.css';

function App() {
  return (
    <PageLayout>
      <div className='page-content'>
        <Switch>
          <Route path='/' exact component={Agenda} />
          <Route path='/pending' component={Pending} />
          <Route path='/meetings/:id' component={MeetingDetails} />
        
        </Switch>
      </div>
    </PageLayout>
  );
}

export default App;

function Todo() {
  return (
    <div>Pending</div>
  );
}
