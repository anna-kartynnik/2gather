import React, { Component } from 'react';

import './DurationInput.scss';

import { InputNumber } from 'antd';

  
function DurationInput(props) {

  const onChange = (value) => {
    console.log('changed', value);
  }

  return (
    <InputNumber
      className='duration-input form-control'
      min={1}
      
      defaultValue={60}
      onChange={onChange}
    />
  );

};

export default DurationInput;




