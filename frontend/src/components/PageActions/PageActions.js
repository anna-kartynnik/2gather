import './PageActions.scss';

import Stack from 'react-bootstrap/Stack';

function PageActions(props) {
  return (
    <Stack direction='horizontal' className='actions'>
      { props.title &&
        <h4>{props.title}</h4>
      }
      <div className='ms-auto button-wrapper'>
        { props.buttonComponent }
      </div>
    </Stack>
  );
}

export default PageActions;
