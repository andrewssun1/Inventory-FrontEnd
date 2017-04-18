//Allows users and admins to view requests
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from '../TextEntryFormElement'
import {checkAuthAndAdmin} from "../Utilities";
import {restRequest} from "../Utilities.js"
import TypeConstants from "../TypeConstants.js"
import AlertComponent from "../AlertComponent.js";
import ViewRequestBody from "./ViewRequestBody.js"
import {Modal, Button, Label, FormControl, FormGroup, InputGroup, Tooltip, OverlayTrigger} from 'react-bootstrap';
var moment = require('moment');

class ViewRequestModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      shouldRenderButtons: false,
      bodyHasUnselectedAsset: false
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
    this.cancel = this.cancel.bind(this);
    this.approve = this.approve.bind(this);
    this.deny = this.deny.bind(this);
    this.fulfill = this.fulfill.bind(this);
    this.patchRequest = this.patchRequest.bind(this);
    this.bodyHasMounted = this.bodyHasMounted.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({shouldRenderButtons: false});
    this.setState({showModal: false});
  }

  cancel() {
    //TODO: change placeholder
    var requestBody = {"id": this._viewRequestBody.state.requestData.id,
    "comment":"Placeholder for now"};
    this.patchRequest('cancel', requestBody);
  }

  approve() {
    var requestBody = {"id": this._viewRequestBody.state.requestData.id,
    "staff_comment":this._commentsField.state.value};
    this.patchRequest('approve', requestBody);
  }

  deny() {
    var requestBody = {"id": this._viewRequestBody.state.requestData.id,
    "staff_comment":this._commentsField.state.value};
    this.patchRequest('deny', requestBody);
  }

  fulfill() {
    var requestBody = {"id": this._viewRequestBody.state.requestData.id};
    this.patchRequest('fulfill', requestBody);
  }

  patchRequest(type, requestBody) {
    var jsonResult = JSON.stringify(requestBody);
    var dict = {deny: "denied", cancel: "cancelled", approve: "approved", fulfill: "fulfilled"};
    restRequest("PATCH", "/api/request/"+type+"/"+this._viewRequestBody.state.requestData.id+"/", "application/json",
                jsonResult,
                (responseText)=>{
                  var response = JSON.parse(responseText);
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
                  this.props.updateCallback._alertchild.generateError(errorResponse.detail);
                  if (typeof this.props.updateCallback.getAllRequests == 'function') {
                      this.props.updateCallback.getAllRequests(null);
                  }
                  this.closeModal();
                })
  }

  bodyHasMounted() {
    this.setState({shouldRenderButtons: true});
  }

  renderButtons() {
    var buttons = [];
    const isStaff = (localStorage.isStaff === "true");
    const isApproved = (this._viewRequestBody.state.requestData.status === "approved");
    if(this._viewRequestBody.isOutstanding()) {
      if(isStaff) {
        buttons.push(<div key="textElements"> <TextEntryFormElement controlId="formHorizontalComments" label="Comments"
        type={TypeConstants.Enum.LONG_STRING} initialValue="" ref={(child) => {this._commentsField = child;}}/>
        <br /> <br /> <br /> <br /> </div>);
        if(this._viewRequestBody.state.requestProblemString === "") {
          buttons.push(<Button key="approve" onClick={this.approve}
          disabled={this.state.bodyHasUnselectedAsset} bsStyle="success">Approve Cart</Button>);
        }
        buttons.push(<Button key="deny" onClick={this.deny} bsStyle="danger">Deny Cart</Button>);
      } else {
        buttons.push(<Button key="cancel" onClick={this.cancel} bsStyle="danger">Cancel Cart</Button>);
      }
    }
    else if(isApproved && isStaff){
      buttons.push(<Button key="fulfill" onClick={this.fulfill} bsStyle="primary">Fulfill Cart</Button>)
    }
    buttons.push(<Button key="close" bsStyle="danger" onClick={this.closeModal} >Close</Button>);
    return buttons;
  }

  render() {
    return (
      <div>
      <Bootstrap.Modal bsSize="large" show={this.state.showModal} onHide={this.closeModal}>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <Modal.Header>
      <Modal.Title>View Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <ViewRequestBody parent={this} id={this.state.id}
      ref={(child) => { this._viewRequestBody = child; }}/>
      </Modal.Body>
      <Modal.Footer>
      {this.state.shouldRenderButtons ?
      this.renderButtons()
      : null}
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default ViewRequestModal
