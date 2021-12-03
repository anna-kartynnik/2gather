import React from 'react';

import './DateTimeRangeInput.scss';

import { DatePicker } from 'antd';

import moment from 'moment';

const { RangePicker } = DatePicker;

  
function DateTimeRangeInput(props) {

  const onChange = (value, dateString) => {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
    props.onChange(value);
  }

  const onOk = (value) => {
    console.log('onOk: ', value);
    props.onChange(value);
  }

  return (
    <RangePicker
      value={props.value}
      className='date-time-range-input'
      //showTime={{ format: 'HH:mm' }}
      showTime={{
        defaultValue: [
          moment('8am', 'ha'),
          moment('6pm', 'ha')
        ],
        minuteStep: 15
      }}
      format='D MMM h:mm a'
      onChange={onChange}
      onOk={onOk}
      popupStyle={
        {zIndex: '1056'}
      }
    />
  );

};

export default DateTimeRangeInput;
