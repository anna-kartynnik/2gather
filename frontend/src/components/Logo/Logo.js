import './Logo.scss';

import { LinkContainer } from 'react-router-bootstrap';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';

import logo from './../../images/logo192.png';

function Logo() {
  return (
    <LinkContainer to='/'>
      <Button variant='link' className='btn-logo'>
        <Stack direction='horizontal'>
          <div>
            <img src={logo} className='logo' alt='app logo' />
          </div>&nbsp;&nbsp;&nbsp;&nbsp;
          <div>
            <h1>2gather</h1>
          </div>
        </Stack>
      </Button>
    </LinkContainer>
  );
}

export default Logo;
