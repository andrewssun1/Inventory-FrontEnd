//Allows users and admins to view requests
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from '../TextEntryFormElement';
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
import {restRequest} from "../Utilities.js"

var xhttp = new XMLHttpRequest();

class ViewRequestModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      requestData: null,
      requestProblemString: ""
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.cancel = this.cancel.bind(this);
    this.approve = this.approve.bind(this);
    this.deny = this.deny.bind(this);
    this.patchRequest = this.patchRequest.bind(this);
    this.getDetailedRequest = this.getDetailedRequest.bind(this);
    this.isOutstanding = this.isOutstanding.bind(this);
  }

  getDetailedRequest(id, cb) {
    restRequest("GET", "/api/request/detailed/"+id+"/", "application/json", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  console.log("Getting Response");
                  console.log(response);
                  this.setState({requestData: response}, cb);
                  if(response.quantity > response.item.quantity) {
                    this.setState({requestProblemString: "Cannot approve: requested quantity exceeds quantity in stock for this item"});
                  } else {
                    this.setState({requestProblemString: ""});
                  }
                  //cb();
                }, ()=>{console.log("Get detailed request failed");}
                )
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  cancel() {
    //TODO: change placeholder
    var requestBody = {"id": this.state.requestData.id,
    "reason":"Placeholder for now"};
    this.patchRequest('cancel', requestBody);
  }

  approve() {
    var requestBody = {"id": this.state.requestData.id,
    "admin_comment":this._commentsField.state.value};
    this.patchRequest('approve', requestBody);
  }

  deny() {
    var requestBody = {"id": this.state.requestData.id,
    "admin_comment":this._commentsField.state.value};
    this.patchRequest('deny', requestBody);
  }

  isOutstanding() {
    return (this.state.requestData.status === "outstanding");
  }

  patchRequest(type, requestBody) {
    var jsonResult = JSON.stringify(requestBody);
    restRequest("PATCH", "/api/request/"+type+"/"+this.state.requestData.id+"/",
                jsonResult,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  console.log("Getting Response");
                  console.log(response);
                  this.props.updateCallback.getAllRequests(null);
                  this.closeModal();
                }, ()=>{
                  console.log("PATCH FAILED");
                  this.props.updateCallback.getAllRequests(null);
                  this.closeModal();
                })
  }

  render() {
    const isAdmin = (localStorage.isAdmin === "true");

    return (
      (this.state.requestData !== null) ?
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      <p> Item: {this.state.requestData.item.name} </p>
      <p> Quantity: {this.state.requestData.quantity} </p>
      <p> Reason: {this.state.requestData.reason} </p>
      <br />
      {(this.state.requestData.status !== "outstanding") ? <div>
      {(this.state.requestData.status === "approved") ? <h4> Approved </h4> : <h4> Denied </h4>}
      <p> By: {this.state.requestData.admin.username} </p>
      <p> At time: {this.state.requestData.admin_timestamp} </p>
      <p> Comments: {this.state.requestData.admin_comment} </p>
      </div>
      :
      <h4> Outstanding </h4>
      }
      <p style={{color:"red"}}> {this.state.requestProblemString} </p>
      </Modal.Body>
      <Modal.Footer>
      {isAdmin ?
      <div>
      {this.isOutstanding() ? <div> <TextEntryFormElement controlId="formHorizontalComments" label="Comments"
      type="text" initialValue="" componentClass="textarea" ref={(child) => {this._commentsField = child;}}/>
      <br /> <br /> <br /> <br /> </div> : null}
      {(this.isOutstanding() && this.state.requestProblemString === "") ?
      <Button onClick={this.approve} bsStyle="success">Approve Request</Button> : null}
      {this.isOutstanding() ? <Button onClick={this.deny} bsStyle="danger">Deny Request</Button> : null}
      <Button onClick={this.closeModal} >Close</Button>
      </div>
      :
      <div>
      {this.isOutstanding() ? <Button onClick={this.cancel} bsStyle="danger">Cancel Request</Button> : null}
      <Button onClick={this.closeModal} >Close</Button>
      </div>
      }
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
      : null
    )
  }
}

export default ViewRequestModal
