import './Logo.scss';

import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';

import logo from './../../images/logo192.png';

function Logo() {
  return (
    <Link to='/'>
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
    </Link>
  );
}

export default Logo;
