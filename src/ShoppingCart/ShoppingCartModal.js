var React = require('react');
var Bootstrap = require('react-bootstrap');

import { Modal, FormGroup, Col, ControlLabel, FormControl, Button} from 'react-bootstrap';
import {restRequest} from "../Utilities.js";

export default class ShoppingCartModal extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      showModal: false,
      reason: ""
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.submitCart = this.submitCart.bind(this);
  }

  handleTextChange(e) {
    this.setState({reason: e.target.value});
  }

  openModal(){
    this.setState({showModal: true});
  }

  closeModal(){
    this.setState({showModal: false});
  }

  getNewActiveCart(){
    restRequest("GET", "/api/shoppingCart/active/", "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  localStorage.activecartid = response.id;
                  localStorage.setItem("cart_quantity", response.requests.length);
                  console.log(response);
                }, (status, responseText)=>{console.log(JSON.parse(responseText))});
  }

  submitCart(){
    var sendJSON = JSON.stringify({
      id: localStorage.activecartid,
      reason: this.state.reason
    });
    restRequest("PATCH", "/api/shoppingCart/send/"+localStorage.activecartid+"/", "application/JSON", sendJSON,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  this.getNewActiveCart();
                  this.props.updateCallback.componentWillMount();
                }, ()=>{});
    this.closeModal();
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
                    <FormControl
                      componentClass="textarea"
                      placeholder="Enter reason for request (required)"
                      onChange={this.handleTextChange}
                    />
          </FormGroup>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle="success" onClick={this.submitCart}>Save</Button>
        <Button onClick={this.closeModal} >Cancel</Button>
      </Modal.Footer>
    </Modal>
    );
  }

}
