import React from 'react';

import './DateTimeRangeInput.scss';

import { DatePicker } from 'antd';

import moment from 'moment';

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
      //showTime={{ format: 'HH:mm' }}
      showTime={{
        defaultValue: [
          moment('08:00', 'HH:mm'),
          moment('18:00', 'HH:mm')],
      }}
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
