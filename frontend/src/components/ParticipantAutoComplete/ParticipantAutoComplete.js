import React, { useState, useEffect } from 'react';

import './ParticipantAutoComplete.scss';

import { Select } from 'antd';

import { getParticipants } from './../../services/aws/meetings';

const { Option } = Select;


function ParticipantAutoComplete(props) {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    getParticipants().then((data) => {
      setParticipants(data);
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  function handleChange(value) {
    console.log(`selected ${value}`);
  }

  return (
    <Select mode='tags'
      placeholder='Start typing a participant name'
      className='participants-auto-complete'
      onChange={handleChange}>
      { participants.map(
          (participant) =>
            <Option key={participant.id}>{participant.email}</Option>
        )
      }
    </Select>
  );
};

export default ParticipantAutoComplete;
