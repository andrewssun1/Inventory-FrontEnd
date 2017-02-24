//Allows users and admins to view requests
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from '../TextEntryFormElement';
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
import {restRequest} from "../Utilities.js"
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

class ViewRequestModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      requestData: [],
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
    restRequest("GET", "/api/shoppingCart/detailed/"+id+"/", "application/json", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  console.log("Getting Response");
                  console.log(response);
                  var errorItems = [];
                  for (var i = 0; i < response.requests.length; i++){
                    response.requests[i].name = response.requests[i].item.name;
                    if(response.requests[i].quantity_requested > response.requests[i].item.quantity) {
                      errorItems.push(response.requests[i].name);
                      // this.setState({requestProblemString: "Cannot approve: requested quantity exceeds quantity in stock for this item"});
                    }
                  }
                  if (errorItems.length === 0 || response.status !== "outstanding"){
                    this.setState({requestProblemString: ""});
                  }
                  else{
                    var errorString = "Cannot approve. Requested quantity exceeds quantity in stock for the following items: "
                    for (var j = 0; j < errorItems.length-1; j++){
                      errorString = errorString + errorItems[j] + ", ";
                    }
                    errorString = errorString + errorItems[errorItems.length-1];
                    this.setState({requestProblemString: errorString});
                  }

                  this.setState({requestData: response}, cb);

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
    restRequest("PATCH", "/api/shoppingCart/"+type+"/"+this.state.requestData.id+"/", "application/json",
                jsonResult,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  console.log("Getting Response");
                  console.log(response);
                  this.props.updateCallback.getAllRequests(null);
                  this.closeModal();
                }, ()=>{
                  console.log("PATCH FAILED!");
                  this.props.updateCallback.getAllRequests(null);
                  this.closeModal();
                })
  }

  render() {
    const isAdmin = (localStorage.isAdmin === "true");

    return (
      (this.state.requestData.length !== 0) ?
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
        <BootstrapTable ref="viewRequestModal" data={this.state.requestData.requests} striped hover>
        <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
        <TableHeaderColumn dataField='name'>Name</TableHeaderColumn>
        <TableHeaderColumn dataField='quantity_requested' dataAlign="center">Quantity</TableHeaderColumn>
        </BootstrapTable>
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
