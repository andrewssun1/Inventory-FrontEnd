//Allows users and admins to view requests
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from './TextEntryFormElement';
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;

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

  getDetailedRequest(id) {
    xhttp.open('GET', "https://asap-test.colab.duke.edu/api/request/detailed/" + id + "/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    if (xhttp.status === 401 || xhttp.status === 500){
      console.log('PATCH Failed!!');
    }
    else{
      xhttp.send();
      var response = JSON.parse(xhttp.responseText);
      console.log("Getting Response");
      console.log(response);
      this.setState({requestData: response});
      if(response.quantity > response.item.quantity) {
        this.setState({requestProblemString: "Cannot approve: requested quantity exceeds quantity in stock for this item"});
      } else {
        this.setState({requestProblemString: ""});
      }
    }
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  cancel() {
    var requestBody = {"id": this.state.requestData.id,
    "reason":"Placeholder for now"};
    this.patchRequest('cancel', requestBody);
  }

  approve() {
    var requestBody = {"id": this.state.requestData.id,
    "admin_comment":"Placeholder for now"};
    this.patchRequest('approve', requestBody);
  }

  deny() {
    var requestBody = {"id": this.state.requestData.id,
    "admin_comment":"Placeholder for now"};
    this.patchRequest('deny', requestBody);
  }

  isOutstanding() {
    return (this.state.requestData.status == "outstanding");
  }

  patchRequest(type, requestBody) {
    xhttp.open('PATCH', "https://asap-test.colab.duke.edu/api/request/" + type + "/" + this.state.requestData.id + "/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    if (xhttp.status === 401 || xhttp.status === 500){
      console.log('PATCH Failed!!');
    }
    else{
      console.log(requestBody);
      var jsonResult = JSON.stringify(requestBody);
      xhttp.send(jsonResult);
      var response = JSON.parse(xhttp.responseText);
      console.log("Getting Response");
      console.log(response);
    }
    this.props.updateCallback.getAllRequests(null);
    this.closeModal();
  }

  render() {
    const isAdmin = (localStorage.isAdmin == "true");

    return (
      (this.state.requestData != null) ?
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      <p> Item: {this.state.requestData.item.name} </p>
      <p> Quantity: {this.state.requestData.quantity} </p>
      <p> Reason: {this.state.requestData.reason} </p>
      <p style={{color:"red"}}> {this.state.requestProblemString} </p>
      </Modal.Body>
      <Modal.Footer>
      {isAdmin ?
      <div>
      {(this.isOutstanding() && this.state.requestProblemString == "") ?
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
