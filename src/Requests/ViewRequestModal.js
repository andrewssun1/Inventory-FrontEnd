//Allows users and admins to view requests
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from '../TextEntryFormElement'
import {checkAuthAndAdmin} from "../Utilities";
import {restRequest} from "../Utilities.js"
import TypeConstants from "../TypeConstants.js"
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {Modal, Button, Label} from 'react-bootstrap';
var moment = require('moment');

class ViewRequestModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      requestData: [],
      requestProblemString: "",
      isStaff: false
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.cancel = this.cancel.bind(this);
    this.approve = this.approve.bind(this);
    this.deny = this.deny.bind(this);
    this.patchRequest = this.patchRequest.bind(this);
    this.getDetailedRequest = this.getDetailedRequest.bind(this);
    this.isOutstanding = this.isOutstanding.bind(this);
    this.renderBottomComponents = this.renderBottomComponents.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
  }

  componentWillMount(){
    checkAuthAndAdmin(()=>{
        this.setState({isStaff: (localStorage.isStaff === "true")})
    })
  }

  getDetailedRequest(id, cb) {
    restRequest("GET", "/api/request/"+id, "application/json", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  console.log("Getting Response");
                  console.log(response);
                  var errorItems = [];
                  var cartDisbursements = response.cart_disbursements;
                  for (var i = 0; i < cartDisbursements.length; i++){
                    cartDisbursements[i].name = cartDisbursements[i].item.name;
                    if(cartDisbursements[i].quantity > cartDisbursements[i].item.quantity) {
                      errorItems.push(cartDisbursements[i].name);
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
                    errorString += errorItems[errorItems.length-1];
                    this.setState({requestProblemString: errorString});
                  }

                  this.setState({requestData: response}, cb);

                  //cb();
                }, ()=>{console.log("Get detailed request failed!");}
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
    "comment":"Placeholder for now"};
    this.patchRequest('cancel', requestBody);
  }

  approve() {
    var requestBody = {"id": this.state.requestData.id,
    "staff_comment":this._commentsField.state.value};
    this.patchRequest('approve', requestBody);
  }

  deny() {
    var requestBody = {"id": this.state.requestData.id,
    "staff_comment":this._commentsField.state.value};
    this.patchRequest('deny', requestBody);
  }

  isOutstanding() {
    return (this.state.requestData.status === "outstanding");
  }

  patchRequest(type, requestBody) {
    var jsonResult = JSON.stringify(requestBody);
    var dict = {deny: "denied", cancel: "cancelled", approve: "approved"};
    restRequest("PATCH", "/api/request/"+type+"/"+this.state.requestData.id+"/", "application/json",
                jsonResult,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  console.log("Getting Response");
                  console.log(response);
                  this.props.updateCallback._alertchild.generateSuccess("Successfully " + dict[type] + " request.");
                  if (typeof this.props.updateCallback.getAllRequests == 'function') {
                      this.props.updateCallback.getAllRequests(null);
                  }
                  if (typeof this.props.updateCallback.cleanFilter == 'function') {
                    this.props.updateCallback.cleanFilter();
                  }
                  this.closeModal();
                }, (status, errResponse)=>{
                  var errorResponse = JSON.parse(errResponse);
                  console.log("PATCH FAILED!");
                  this.props.updateCallback._alertchild.generateError(errorResponse.detail);
                  if (typeof this.props.updateCallback.getAllRequests == 'function') {
                      this.props.updateCallback.getAllRequests(null);
                  }
                  this.closeModal();
                })
  }

  renderStaffInfo(){
    let data = this.state.requestData;
    return(
      <div>
        <p> <b>By: </b>{data.staff} </p>
        <p> <b>At time: </b>{moment(data.staff_timestamp).format('lll')} </p>
        <p> <b>Comments: </b>{data.staff_comment} </p>
      </div>
    );
  }

  renderBottomComponents() {
    let data = this.state.requestData;
    switch (this.state.requestData.status) {
      case "approved":
      case "denied":
        return(
          <div>
          {(this.state.requestData.status === "approved") ? <h4><Label bsStyle="success"> Approved </Label></h4> : <h4><Label bsStyle="danger"> Denied </Label></h4>}
          {this.renderStaffInfo()}
          </div>);
      case "fulfilled":
        return(<div>
          <h4><Label bsStyle="primary"> Fulfilled </Label></h4>
          {this.renderStaffInfo()}
        </div>);
      case "outstanding":
        return(<h4><Label bsStyle="warning"> Outstanding </Label></h4>);
      default:
        return(<h4><Label bsStyle="danger"> Cancelled </Label></h4>);
    }
  }

  renderButtons() {
    var buttons = [];
    const isStaff = (localStorage.isStaff === "true");
    if(this.isOutstanding()) {
      if(isStaff) {
        buttons.push(<div key="textElements"> <TextEntryFormElement controlId="formHorizontalComments" label="Comments"
        type={TypeConstants.Enum.LONG_STRING} initialValue="" ref={(child) => {this._commentsField = child;}}/>
        <br /> <br /> <br /> <br /> </div>);
        if(this.state.requestProblemString === "") {
          buttons.push(<Button key="approve" onClick={this.approve} bsStyle="success">Approve Cart</Button>);
        }
        buttons.push(<Button key="deny" onClick={this.deny} bsStyle="danger">Deny Cart</Button>);
      } else {
        buttons.push(<Button key="cancel" onClick={this.cancel} bsStyle="danger">Cancel Cart</Button>);
      }
    }
    buttons.push(<Button key="close" bsStyle="danger" onClick={this.closeModal} >Close</Button>);
    return buttons;
  }

  render() {
    return (
      (this.state.requestData.length !== 0) ?
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Header>
      <Modal.Title>View Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <BootstrapTable ref="viewRequestModal" data={this.state.requestData.cart_disbursements} striped hover>
        <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
        <TableHeaderColumn dataField='name'>Name</TableHeaderColumn>
        <TableHeaderColumn dataField='quantity' dataAlign="center">Quantity</TableHeaderColumn>
        </BootstrapTable>
      <br />
      <p> <b>Request Reason: </b>{this.state.requestData.reason} </p>
      {this.renderBottomComponents()}
      <p style={{color:"red"}}> {this.state.requestProblemString} </p>
      </Modal.Body>
      <Modal.Footer>
      {this.renderButtons()}
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
      : null
    )
  }
}

export default ViewRequestModal
