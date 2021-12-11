import React, { useState, useEffect } from 'react';

import './ParticipantAutoComplete.scss';

import { Select } from 'antd';

import { getParticipants } from './../../services/aws/meetings';

const { Option } = Select;


function ParticipantAutoComplete(props) {
  const [prevParticipants, setPrevParticipants] = useState(props.initialValue);

  const { initialValue, currentUser } = props;

  useEffect(() => {
    getParticipants(currentUser.id).then((resp) => {
      // [TODO] preserve default value
      console.log(initialValue);
      console.log(resp);
      const participants = resp.data.filter((p) => p.email);
      for (let initial of initialValue) {
        if (!participants.find((p) => p.email === initial.email)) {
          participants.push(initial);
        }
      }

      setPrevParticipants(participants);
    }).catch((err) => {
      console.log(err);
    });
  }, []);

  const handleChange = (value) => {
    console.log(`selected ${value}`);
    console.log(value);
    const selected = [];
    // for (let item of value) {
    //   const itemInt = parseInt(item, 10);
    //   if (Number.isNaN(itemInt)) {
    //     // Should be a new value. [TODO] validate email?
    //     selected.push({
    //       id: `email:${item}`
    //     });
    //   } else {
    //     // Otherwise it's selected from the provided list.
    //     selected.push(prevParticipants[itemInt]);
    //   }
    // }
    props.onChange(value);//selected);
  };

  return (
    <Select mode='tags'
      labelInValue
      placeholder='Start typing a participant name'
      className='participants-auto-complete'
      defaultValue={props.initialValue.map((p) => ({
        label: p.email,
        value: p.id || `email:${p.email}`
      }))}
      onChange={handleChange}
      options={prevParticipants.map((p) => ({
        label: p.email,
        value: p.id || `email:${p.email}`
      }))}>
      { /*prevParticipants.map(
          (participant, index) =>
            <Option key={index}>{participant.email}</Option>
        )
      */}
    </Select>
  );
};

export default ParticipantAutoComplete;
