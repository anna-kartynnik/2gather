import './PageLayout.scss';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Logo from './../Logo/Logo';

import logo from './../../images/logo192.png';
import notif from './../../images/notification.svg';

function PageLayout(props) {
  return (
    <Container className='page-layout'> {/* vh-100 d-flex flex-column'>*/}
      <Row className='header'>
        <Stack direction='horizontal' gap={3}>
         {/* <div><img src={logo} className='logo' alt='app logo' /></div>
          <div><h1>2gather</h1></div>*/}
          <Logo />
          <div className='ms-auto'><img src={notif} alt='notifications' /></div>
          <div>avatar</div>
        </Stack>
      </Row>
      <Row className='page-content'> {/* vh-100'> */}
        { props.children }
      </Row>
{/*      <Row className='footer'>
        Footer
      </Row>*/}
    </Container>
  );
}

export default PageLayout;
