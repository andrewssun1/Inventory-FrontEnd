var React = require('react');

import { Modal, FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap';
import {checkAuthAndAdmin, handleErrors} from "../Utilities";
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
      userIdMap: {},
      isStaff: false,
      isSubmitDisabled : false
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.submitCart = this.submitCart.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.submitDisbursement = this.submitDisbursement.bind(this);
  }

  componentWillMount(){
      checkAuthAndAdmin(()=>{
          this.setState({isStaff : (localStorage.isStaff === "true")})
      })
  }

  handleTextChange(e) {
    this.setState({reason: e.target.value});
    if(localStorage.isStaff === "false" && (e.target.value == "" || e.target.value == null)) {
      this.setState({isSubmitDisabled: true});
    } else {
      this.setState({isSubmitDisabled: false});
    }
  }

  openModal(){
    const isStaff = (localStorage.isStaff === "true");
    if (isStaff === true){
      restRequest("GET", "/api/user/large/", "application/JSON", null,
                  (responseText)=>{
                    var currUsers = [];
                    var response = JSON.parse(responseText);
                    for (var i = 0; i < response.results.length; i++){
                      var username = response.results[i].username;
                      currUsers.push({label: username, value: response.results[i].id});
                      // usermap[response.results[i].username] = response.results[i].id
                    }
                    this.setState({users: currUsers, showModal: true});
                  }, ()=>{});
    }
    else{
      this.setState({showModal: true});
      this.setState({isSubmitDisabled: true});
    }
  }

  closeModal(){
    this.setState({showModal: false});
  }

  // TODO: Change this
  getNewActiveCart(){
    const isStaff = (localStorage.isStaff === "true");
    var url = "/api/request/active/";
    restRequest("GET", url, "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  var disburseRequest = response.cart_disbursements;
                  localStorage.activecartid = response.id;
                  localStorage.setItem("cart_quantity", disburseRequest.length);
                }, (status, responseText)=>{});
  }

  submitCart(){
    var sendJSON = JSON.stringify({
      reason: this.state.reason
    });
    restRequest("PATCH", "/api/request/send/"+localStorage.activecartid+"/", "application/JSON", sendJSON,
                (responseText)=>{
                  this.getNewActiveCart();
                  this.props.updateCallback.componentDidMount();
                  this.props.updateCallback._alertchild.generateSuccess("Request sent!");
                }, (status, errResponse)=>{
                  handleErrors(errResponse, this.props.updateCallback._alertchild);
                });
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
    var sendJSON = JSON.stringify({
      owner_id: parseInt(this.state.selectedUser, 10),
      staff_comment: this.state.reason
    });
    restRequest("PATCH", "/api/request/dispense/"+localStorage.activecartid+"/", "application/JSON", sendJSON,
                (responseText)=>{
                  this.getNewActiveCart();
                  this.props.updateCallback.componentDidMount();
                  this.props.updateCallback._alertchild.generateSuccess("Disbursement successfully sent.");
                }, (status, errResponse)=>{

                  if (JSON.parse(errResponse).owner_id != null){
                    this.props.updateCallback._alertchild.generateError("User field may not be empty.");
                  }
                  else if (JSON.parse(errResponse).detail != null){
                    this.props.updateCallback._alertchild.generateError(JSON.parse(errResponse).detail);
                  }
                  else{
                    this.props.updateCallback._alertchild.generateError("Server error. Contact system admin.");
                  }
                });
    this.closeModal();
  }

  render(){
    // TODO: front end make sure user enters something
    return(
      <Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Header>
        <Modal.Title>{this.state.isStaff ? "Direct Dispense Cart" : "Request Cart"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <FormGroup controlId="formBasicText" >
                    <ControlLabel>{this.state.isStaff ? "Comment" : "Reason"}</ControlLabel>
                    <FormControl
                      componentClass="textarea"
                      placeholder={this.state.isStaff ? "Enter optional comment" : "Enter reason for request (required)"}
                      onChange={this.handleTextChange}
                    />
          </FormGroup>
        </form>
      {this.state.isStaff ? this.createUserChooser() : null}
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle="success" disabled={this.state.isSubmitDisabled} onClick={(this.state.isStaff ? this.submitDisbursement: this.submitCart)}>Submit</Button>
        <Button bsStyle="danger" onClick={this.closeModal} >Cancel</Button>
      </Modal.Footer>
    </Modal>
    );
  }

}
