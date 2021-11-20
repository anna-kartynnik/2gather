import ToastContainer from 'react-bootstrap/ToastContainer';
import Toast from 'react-bootstrap/Toast';


function CustomToast(props) {
  return (
    <ToastContainer className="p-3" position="top-center">
      <Toast onClose={props.onClose} bg={props.bg} delay={props.delay || 3000} autohide>
{/*        <Toast.Header closeButton={false}>
           <img
                src="holder.js/20x20?text=%20"
                className="rounded me-2"
                alt=""
              />
              <strong className="me-auto">Bootstrap</strong>
              <small>11 mins ago</small>
            </Toast.Header>*/}
        <Toast.Body className="text-white">{props.text}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default CustomToast;