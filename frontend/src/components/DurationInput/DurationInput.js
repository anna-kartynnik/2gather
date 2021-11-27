import React from 'react';

import './DurationInput.scss';

import { InputNumber } from 'antd';

  
function DurationInput(props) {

  // const onChange = (value) => {
  //   console.log('changed', value);
  // }

  return (
    <InputNumber
      className='duration-input form-control'
      min={1}
      value={props.value}
      defaultValue={60}
      onChange={props.onChange}
    />
  );

};

export default DurationInput;




