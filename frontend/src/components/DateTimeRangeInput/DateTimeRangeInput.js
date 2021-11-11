import React, { Component } from 'react';

import './DateTimeRangeInput.scss';

import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

  
function DateTimeRangeInput(props) {

  const onChange = (value, dateString) => {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
  }

  const onOk = (value) => {
    console.log('onOk: ', value);
  }

  return (
    <RangePicker
      className='date-time-range-input'
      showTime={{ format: 'HH:mm' }}
      format='YYYY-MM-DD HH:mm'
      onChange={onChange}
      onOk={onOk}
      popupStyle={
        {zIndex: '1056'}
      }
    />
  );

};

export default DateTimeRangeInput;
