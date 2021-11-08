//import './PageLayout.scss';

import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';

function PageActions(props) {
  return (
    <Stack direction='horizontal' className='actions'>
      <div className='ms-auto'>
        <Button variant='primary' size='lg'
          onClick={props.onClick}>
          { props.label }
        </Button>
      </div>
    </Stack>
  );
}

export default PageActions;
