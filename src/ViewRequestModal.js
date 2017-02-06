//Allows users and admins to view requests
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from './TextEntryFormElement';
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;

class ViewRequestModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.cancel = this.cancel.bind(this);
    this.approve = this.approve.bind(this);
    this.deny = this.deny.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  cancel() {
    console.log('Cancel');
  }

  approve() {
    console.log('Approve');
  }

  deny() {
    console.log('Deny');
  }

  render() {
    const isAdmin = (localStorage.isAdmin == "true");

    return (
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      <p> Item: {this.props.item} </p>
      <p> Quantity: {this.props.quantity} </p>
      <p> Reason: {this.props.reason} </p>
      </Modal.Body>
      <Modal.Footer>
      {isAdmin ?
      <div>
      <Button onClick={this.approve} bsStyle="success">Approve Request</Button>
      <Button onClick={this.deny} bsStyle="danger">Deny Request</Button>
      <Button onClick={this.closeModal} >Close</Button>
      </div>
      :
      <div>
      <Button onClick={this.cancel} bsStyle="danger">Cancel Request</Button>
      <Button onClick={this.closeModal} >Close</Button>
      </div>
      }
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default ViewRequestModal
