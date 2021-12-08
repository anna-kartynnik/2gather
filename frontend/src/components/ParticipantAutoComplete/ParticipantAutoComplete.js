import React, { useState, useEffect } from 'react';

import './ParticipantAutoComplete.scss';

import { Select } from 'antd';

import { getParticipants } from './../../services/aws/meetings';

const { Option } = Select;


function ParticipantAutoComplete(props) {
  const [prevParticipants, setPrevParticipants] = useState(props.initialValue);

  const { initialValue } = props;

  useEffect(() => {
    getParticipants().then((data) => {
      // [TODO] preserve default value
      console.log(initialValue);
      data.push(...initialValue);
      setPrevParticipants(data);
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
        value: p.id
      }))}
      onChange={handleChange}
      options={prevParticipants.map((p) => ({
        label: p.email,
        value: p.id
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
