import React from 'react';

import Form from 'react-bootstrap/Form';

const SwitchElement = (props) => {
  return (
    <Form>
      <Form.Check 
        type='switch'
        id='custom-switch'
        label='Confirmed only'
        checked={props.isConfirmedOnly}
        onChange={props.onConfirmedOnlyChange}
      />
    </Form>
  );
};

export default SwitchElement;