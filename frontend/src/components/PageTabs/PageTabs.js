//import './PageLayout.scss';

import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';


function PageTabs(props) {
  console.log(window.location);
  let activeTab = 'agenda';
  if (window.location.pathname === '/pending') {
    activeTab = 'pending';
  } else if (window.location.pathname === '/created') {
    activeTab = 'created';
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
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to='/created' eventKey='created'>Created</Nav.Link>
      </Nav.Item>
    </Nav>
  );
}

export default PageTabs;
