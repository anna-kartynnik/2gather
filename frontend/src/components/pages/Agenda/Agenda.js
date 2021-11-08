import React, { useState, useEffect } from 'react';

import SwitchElement from './../../SwitchElement/SwitchElement';
import AgendaList from './AgendaList';
import Spinner from './../../Spinner/Spinner';
import PageActions from './../../PageActions/PageActions';
import PageTabs from './../../PageTabs/PageTabs';

import { getAgendaList, getConfirmedAgendaList } from './../../../services/meetings';


function Agenda(props) {
  const [isConfirmedOnly, setIsConfirmedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [listItems, setListItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const getFunc = isConfirmedOnly ? getConfirmedAgendaList : getAgendaList;
    getFunc().then((items) => {
      setIsLoading(false);
      setListItems(items);
    }).catch((err) => {
      console.log(err);
      setIsLoading(false);
      setError(err?.message || 'An error has occurred.');
    });

  }, [isConfirmedOnly]);

  const handleConfirmedOnlyChange = (evt) => {
    setIsConfirmedOnly(evt.target.checked);
  }

  return (
    <>
      <PageActions
        label='Create'
        onClick={(evt) => {console.log('TODO');}}
      />
      <PageTabs />
      <div className='m-3'></div>
      <SwitchElement
        isConfirmedOnly={isConfirmedOnly}
        onConfirmedOnlyChange={handleConfirmedOnlyChange}
      />
      <div className='m-3'></div>
      { isLoading &&
        <Spinner />
      }
      <AgendaList listItems={listItems} />
    </>
  );
}

export default Agenda;
