//Allows users and admins to view requests
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from '../TextEntryFormElement'
import {checkAuthAndAdmin} from "../Utilities";
import {restRequest} from "../Utilities.js"
import TypeConstants from "../TypeConstants.js"
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
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
    restRequest("GET", "/api/shoppingCart/detailed/"+id+"/", "application/json", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  console.log("Getting Response");
                  console.log(response);
                  var errorItems = [];
                  for (var i = 0; i < response.requests.length; i++){
                    response.requests[i].name = response.requests[i].item.name;
                    if(response.requests[i].quantity > response.requests[i].item.quantity) {
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
                    errorString += errorItems[errorItems.length-1];
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
    var dict = {deny: "denied", cancel: "cancelled", approve: "approved"};
    restRequest("PATCH", "/api/shoppingCart/"+type+"/"+this.state.requestData.id+"/", "application/json",
                jsonResult,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  console.log("Getting Response");
                  console.log(response);
                  this.props.updateCallback._alertchild.generateSuccess("Successfully " + dict[type] + " request.");
                  this.props.updateCallback.getAllRequests(null);
                  this.props.updateCallback.cleanFilter();
                  this.closeModal();
                }, (status, errResponse)=>{
                  var errorResponse = JSON.parse(errResponse);
                  console.log("PATCH FAILED!");
                  this.props.updateCallback._alertchild.generateError(errorResponse.detail);
                  this.props.updateCallback.getAllRequests(null);
                  this.closeModal();
                })
  }

  renderBottomComponents() {
    let data = this.state.requestData;
    switch (this.state.requestData.status) {
      case "approved":
      case "denied":
        return(
          <div>
          {(this.state.requestData.status === "approved") ? <h4> Approved </h4> : <h4> Denied </h4>}
          <p> By: {data.admin.username} </p>
          <p> At time: {moment(data.admin_timestamp).format('lll')} </p>
          <p> Comments: {data.admin_comment} </p>
          </div>);
      case "active":
        return(<h4> Active </h4>);
      default:
        return(<h4> Outstanding </h4>);
    }
  }

  renderButtons() {
    var buttons = [];
    if(this.isOutstanding()) {
      if(this.state.isStaff) {
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
    buttons.push(<Button key="close" onClick={this.closeModal} >Close</Button>);
    return buttons;
  }

  render() {
    return (
      (this.state.requestData.length !== 0) ?
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
        <BootstrapTable ref="viewRequestModal" data={this.state.requestData.requests} striped hover>
        <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
        <TableHeaderColumn dataField='name'>Name</TableHeaderColumn>
        <TableHeaderColumn dataField='quantity' dataAlign="center">Quantity</TableHeaderColumn>
        </BootstrapTable>
      <br />
      <p> Reason: {this.state.requestData.reason} </p>
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
