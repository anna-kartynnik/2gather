//import './PageLayout.scss';

import Nav from 'react-bootstrap/Nav';
//import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';


function PageTabs(props) {
  console.log(window.location);
  let activeTab = 'agenda';
  if (window.location.pathname === '/pending') {
    activeTab = 'pending';
  }
  console.log(activeTab);

  return (
    <Nav variant='pills' activeKey={activeTab}>
      <Nav.Item>
        <Nav.Link as={Link} to='/' eventKey='agenda'>Agenda</Nav.Link>
          {/*<Nav.Link active={'agenda' === activeTab} className={'agenda' === activeTab ? 'active' : ''}>Agenda</Nav.Link>*/}
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to='/pending' eventKey='pending'>Pending</Nav.Link>
{/*          <Nav.Link active={'pending' === activeTab} className={'pending' === activeTab ? 'active' : ''}>Pending</Nav.Link>
        </LinkContainer>*/}
      </Nav.Item>
    </Nav>
  );
}

export default PageTabs;
