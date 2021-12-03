import React from 'react';

import './DurationInput.scss';

import { InputNumber } from 'antd';


function DurationInput(props) {

  return (
    <InputNumber
      {...props}
      className='duration-input form-control'
      min={1}
      defaultValue={60}
    />
  );

};

export default DurationInput;




