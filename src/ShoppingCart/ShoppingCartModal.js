var React = require('react');

import { Modal, FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap';
import {restRequest} from "../Utilities.js";
import Select from 'react-select';

export default class ShoppingCartModal extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      showModal: false,
      reason: "",
      selectedUser: "",
      users: [],
      userIdMap: {}
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.submitCart = this.submitCart.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.submitDisbursement = this.submitDisbursement.bind(this);
  }

  handleTextChange(e) {
    this.setState({reason: e.target.value});
  }

  openModal(){
    const isStaff = (localStorage.isStaff === "true");
    if (isStaff === true){
      restRequest("GET", "/api/user/large/", "application/JSON", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    for (var i = 0; i < response.results.length; i++){
                      var username = response.results[i].username;
                      this.state.users.push({label: username, value: response.results[i].id});
                      // usermap[response.results[i].username] = response.results[i].id
                    }
                    this.setState({showModal: true});
                  }, ()=>{});
    }
    else{
      this.setState({showModal: true});
    }
  }

  closeModal(){
    this.setState({showModal: false});
  }

  // TODO: Change this
  getNewActiveCart(){
    const isStaff = (localStorage.isStaff === "true");
    var url = isStaff ? "/api/disburse/active/" : "/api/shoppingCart/active/";
    restRequest("GET", url, "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  var disburseRequest = isStaff ? response.disbursements : response.requests;
                  localStorage.activecartid = response.id;
                  localStorage.setItem("cart_quantity", disburseRequest.length);
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
                  this.getNewActiveCart();
                  this.props.updateCallback.componentDidMount();
                  this.props.updateCallback._alertchild.generateSuccess("Shopping cart sent!");
                }, ()=>{});
    this.closeModal();
  }

  handleSelectChange(value){
    this.setState({selectedUser: value});
  }

  createUserChooser(){
    return(
      <Select simpleValue value={this.state.selectedUser} placeholder="Select user" options={this.state.users} onChange={this.handleSelectChange} />
    );
  }


  submitDisbursement(){
    console.log(this.state.selectedUser);
    var sendJSON = JSON.stringify({
      receiver_id: parseInt(this.state.selectedUser, 10),
      comment: this.state.reason
    });
    restRequest("PATCH", "/api/disburse/"+localStorage.activecartid, "application/JSON", sendJSON,
                (responseText)=>{
                  this.getNewActiveCart();
                  this.props.updateCallback.componentDidMount();
                  this.props.updateCallback._alertchild.generateSuccess("Disbursement successfully sent.");
                }, (status, errResponse)=>{
                  console.log(errResponse);
                });
    this.closeModal();
  }

  render(){
    const isStaff = (localStorage.isStaff === "true");
    // TODO: front end make sure user enters something
    return(
      <Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>{isStaff ? "Disbursement Cart" : "Request Cart"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <FormGroup controlId="formBasicText" >
                    <ControlLabel>{isStaff ? "Comment" : "Reason"}</ControlLabel>
                    <FormControl
                      componentClass="textarea"
                      placeholder={isStaff ? "Enter optional comment" : "Enter reason for request (required)"}
                      onChange={this.handleTextChange}
                    />
          </FormGroup>
        </form>
      {isStaff ? this.createUserChooser() : null}
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle="success" onClick={(isStaff ? this.submitDisbursement: this.submitCart)}>Submit</Button>
        <Button bsStyle="danger" onClick={this.closeModal} >Cancel</Button>
      </Modal.Footer>
    </Modal>
    );
  }

}
