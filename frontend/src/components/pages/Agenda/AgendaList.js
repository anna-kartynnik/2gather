import React, { useState, useEffect } from 'react';

//import './AgendaList.scss';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
//import Spinner from './../../Spinner/Spinner';
import AgendaListItem from './AgendaListItem';

//import { getAgendaList, getConfirmedAgendaList } from './../../../services/meetings';


function AgendaList(props) {
  // const [isLoading, setIsLoading] = useState(true);
  // const [listItems, setListItems] = useState([]);
  // const [error, setError] = useState('');

  // useEffect(() => {
  //   getAgendaList().then((items) => {
  //     setIsLoading(false);
  //     setListItems(items);
  //   }).catch((err) => {
  //     console.log(err);
  //     setIsLoading(false);
  //     setError(err?.message || 'An error has occurred.');
  //   });

  // }, []);

  return (
    <Stack direction='vertical' gap={2}>
{/*      { isLoading &&
        <Spinner />
      }*/}
      { props.listItems.map(
          (item) => <AgendaListItem key={item.id + (item.proposed_option_number || '0')} item={item} />
        )
      }
    </Stack>
  );
}

export default AgendaList;
