var React = require('react');
var Bootstrap = require('react-bootstrap');

import { Modal, FormGroup, Col, ControlLabel, FormControl, Button} from 'react-bootstrap';
import {restRequest} from "../Utilities.js";

export default class ShoppingCartModal extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      showModal: false
    }
  }

  openModal(){
    this.setState({showModal: true});
  }

  closeModal(){
    this.setState({showModal: true});
  }

  render(){
    return(
      <Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Request Cart</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <FormGroup controlId="formBasicText" >
                    <ControlLabel>Reason</ControlLabel>
                    <Col sm={4}>
                    <FormControl
                      componentClass="textarea"
                      placeholder="Enter reason for request (required)"
                      onChange={this.handleTextChange}
                    />
                    </Col>
          </FormGroup>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle="success" onClick={this.onSendCartClick}>Save</Button>
        <Button onClick={this.closeModal} >Cancel</Button>
      </Modal.Footer>
    </Modal>
    );
  }

}
