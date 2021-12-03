

import BootstrapSpinner from 'react-bootstrap/Spinner';

function Spinner(props) {
  return (
    <BootstrapSpinner as={props.as || "div"} size={props.size} animation="border"
      role="status" variant={props.variant || "primary"}>
      <span className="visually-hidden">Loading...</span>
    </BootstrapSpinner>
  );
}

export default Spinner;