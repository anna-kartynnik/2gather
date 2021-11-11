

import BootstrapSpinner from 'react-bootstrap/Spinner';

function Spinner() {
  return (
    <BootstrapSpinner animation='border' role='status' variant='primary'>
      <span className='visually-hidden'>Loading...</span>
    </BootstrapSpinner>
  );
}

export default Spinner;