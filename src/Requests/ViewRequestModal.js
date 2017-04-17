//Allows users and admins to view requests
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from '../TextEntryFormElement'
import {checkAuthAndAdmin} from "../Utilities";
import {restRequest} from "../Utilities.js"
import TypeConstants from "../TypeConstants.js"
import AlertComponent from "../AlertComponent.js"
import SelectAssetsModal from "./SelectAssetsModal.js"
import SelectionType from './SelectionEnum.js'
import SelectAssetsButton from "./SelectAssetsButton.js"
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {Modal, Button, Label, FormControl, FormGroup, InputGroup, Tooltip, OverlayTrigger} from 'react-bootstrap';
var moment = require('moment');

const AssetSelectStatus = {
  NOT_ASSET: 0,
  SELECT_ASSETS: 1,
  CHANGE_ASSETS: 2
}

class ViewRequestModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      requestData: [],
      requestProblemString: "",
      isStaff: false,
      hasUnselectedAsset: false
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.cancel = this.cancel.bind(this);
    this.approve = this.approve.bind(this);
    this.deny = this.deny.bind(this);
    this.fulfill = this.fulfill.bind(this);
    this.patchRequest = this.patchRequest.bind(this);
    this.getDetailedRequest = this.getDetailedRequest.bind(this);
    this.isOutstanding = this.isOutstanding.bind(this);
    this.renderBottomComponents = this.renderBottomComponents.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
    this.changeRequestType = this.changeRequestType.bind(this);
    this.changeButton = this.changeButton.bind(this);
    this.selectAssetsButton = this.selectAssetsButton.bind(this);
  }

  componentWillMount(){
    checkAuthAndAdmin(()=>{
        this.setState({isStaff: (localStorage.isStaff === "true")})
    })
  }

  getDetailedRequest(id, cb) {
    checkAuthAndAdmin(()=>{
      this.setState({hasUnselectedAsset: false});
      restRequest("GET", "/api/request/"+id, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    console.log("Getting Response");
                    console.log(response);
                    var errorItems = [];
                    this.assignCartVariables(response.cart_disbursements, "disbursement", errorItems);
                    this.assignCartVariables(response.cart_loans, "loan", errorItems);

                    if (errorItems.length === 0 || response.status !== "outstanding"){
                      this.setState({requestProblemString: ""});
                    }
                    else{
                      var errorString = "Cannot approve. Requested quantity exceeds quantity in stock for the following items: "
                      for (var j = 0; j < errorItems.length-1; j++){
                        errorString = errorString + errorItems[j] + ", ";
                      }
                      errorString += errorItems[errorItems.length-1];
                      if (localStorage.isStaff === "true"){
                        this.setState({requestProblemString: errorString});
                      }
                    }

                    this.setState({requestData: response}, cb);
                  }, ()=>{console.log("Get detailed request failed!");}
                  )
      });
  }

  assignCartVariables(cart, status, errorItems) {
    for (var i = 0; i < cart.length; i++) {
      cart[i].name = cart[i].item.name;
      cart[i].status = status;
      cart[i].changeQuantity = cart[i].quantity;
      cart[i].shouldUpdate = false;
      cart[i].is_asset = cart[i].item.is_asset;

      if(cart[i].item.is_asset && cart[i].assets.length < cart[i].quantity) {
        cart[i].assetSelect = AssetSelectStatus.SELECT_ASSETS;
        this.setState({hasUnselectedAsset: true});
      } else if (cart[i].item.is_asset && cart[i].assets.length > 0) {
        cart[i].assetSelect = AssetSelectStatus.CHANGE_ASSETS;
      } else {
        cart[i].assetSelect = AssetSelectStatus.NOT_ASSET;
      }

      if(cart[i].quantity > cart[i].item.quantity) {
        errorItems.push(cart[i].name);
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

  fulfill() {
    var requestBody = {"id": this.state.requestData.id};
    this.patchRequest('fulfill', requestBody);
  }

  isOutstanding() {
    return (this.state.requestData.status === "outstanding");
  }

  patchRequest(type, requestBody) {
    var jsonResult = JSON.stringify(requestBody);
    var dict = {deny: "denied", cancel: "cancelled", approve: "approved", fulfill: "fulfilled"};
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
    const isApproved = (this.state.requestData.status === "approved");
    if(this.isOutstanding()) {
      if(isStaff) {
        buttons.push(<div key="textElements"> <TextEntryFormElement controlId="formHorizontalComments" label="Comments"
        type={TypeConstants.Enum.LONG_STRING} initialValue="" ref={(child) => {this._commentsField = child;}}/>
        <br /> <br /> <br /> <br /> </div>);
        if(this.state.requestProblemString === "") {
          buttons.push(<Button key="approve" onClick={this.approve}
          disabled={this.state.hasUnselectedAsset} bsStyle="success">Approve Cart</Button>);
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

  changeRequestType(row){
    if(row.assetSelect == AssetSelectStatus.NOT_ASSET ||
      row.assetSelect == AssetSelectStatus.SELECT_ASSETS) {
        checkAuthAndAdmin(()=>{
          var id = row.id;
          var url = "/api/request/convertRequestType/";
          var changeTypeJSON = JSON.stringify({
              current_type: row.status,
              pk: id,
              quantity: row.changeQuantity
          });
          restRequest("POST", url, "application/JSON", changeTypeJSON,
              (responseText)=>{
                  var response = JSON.parse(responseText);
                  // this.forceUpdate();
                  this.getDetailedRequest(this.state.requestData.id, ()=>{});
              }, (status, errResponse)=>{
                this._alertchild.generateError("Invalid quantity!");
              }
          );
        });
    } else {
      this._selectAssetsModal.setState({itemID: row.item.id});
      this._selectAssetsModal.setState({type: row.status});
      this._selectAssetsModal.setState({dispensementID: row.id});
      this._selectAssetsModal.setState({numAssetsNeeded: row.changeQuantity});
      this._selectAssetsModal.setState({selectionType: SelectionType.DISPENSEMENT_TYPE_CHANGE});
      this._selectAssetsModal.openModal();
    }
  }

  generateHighQuantityTextBox(row){
    return(
                  <FormControl
                    type="number"
                    min="1"
                    value={row.changeQuantity}
                    style={{width: "72px"}}
                    onChange={(e)=>{
                      try {
                        var valNum = parseInt(e.target.value, 10);
                          row.changeQuantity=valNum;
                          console.log(row.changeQuantity);
                          row.shouldUpdate=(row.status === "loan" && row.returned_quantity !== 0);
                          this.forceUpdate();
                      } catch (e) {
                          this.props.updateCallback._alertchild.generateError("Invalid. Must be integer!!!!");
                      }
                    }}
                  />
      );
  }

  returnItem(row){
    console.log(row);
    if(row.assetSelect == AssetSelectStatus.NOT_ASSET) {
      //Return non-asset item
      checkAuthAndAdmin(()=>{
        var id = row.id;
        var url = "/api/request/loan/returnItem/" + id + "/";
        var returnJSON = JSON.stringify({
            quantity: row.changeQuantity
        });
        restRequest("PATCH", url, "application/JSON", returnJSON,
            (responseText)=>{
                var response = JSON.parse(responseText);
                console.log(response);
                // this.forceUpdate();
                this.getDetailedRequest(this.state.requestData.id, ()=>{});
            }, (status, errResponse)=>{
              this._alertchild.generateError("Invalid quantity!");
            }
        );
      });
    } else {
      //Return Assets
      this._selectAssetsModal.setState({itemID: row.item.id});
      this._selectAssetsModal.setState({type: row.status});
      this._selectAssetsModal.setState({dispensementID: row.id});
      this._selectAssetsModal.setState({numAssetsNeeded: row.changeQuantity});
      this._selectAssetsModal.setState({selectionType: SelectionType.RETURN});
      this._selectAssetsModal.openModal();
    }
  }

  renderReturnButton(row){
    const tooltip = (
      <Tooltip id="tooltip">Click to change quantity to a disbursement.</Tooltip>
    );
    if (row.returned_timestamp != null) {
      return(
        <Label bsStyle="success">Fully Returned</Label>
      )
    }
    else {
      if (row.returned_quantity !== 0 && !row.shouldUpdate) {
        row.changeQuantity = row.quantity - row.returned_quantity;
      }
      return(
        <div>
        {this.generateHighQuantityTextBox(row)}
          {this.state.requestData.status === "fulfilled" ?
            <Button bsSize="small"
                            bsStyle="warning"
                            style={{marginTop: "3px"}}
                            onClick={()=>{this.returnItem(row)}}>
                            Return</Button>
          : null}
          <OverlayTrigger placement="top" overlay={tooltip}>
          <Button bsSize="small"
                    bsStyle="primary"
                    style={{marginTop: "3px"}}
                    onClick={()=>{this.changeRequestType(row)}}>
                    Convert</Button></OverlayTrigger>
        </div>
      )
    }
  }

  renderOutstandingButton(row){
    return (
      <div>
      {this.generateHighQuantityTextBox(row)}
      <Button bsSize="small"
              bsStyle="primary"
              style={{marginTop: "3px"}}
              onClick={()=>{this.changeRequestType(row)}}>
              {"To " + (row.status === "disbursement" ? "loan" : "disbursement")}</Button>
            </div>
    );
  }

  changeButton(cell, row){
    return (
        <div>
        <FormGroup style={{marginBottom: "0px"}} controlId="formBasicText" >
        <InputGroup>
          {this.isOutstanding() ? this.renderOutstandingButton(row):
          this.renderReturnButton(row)}
        </InputGroup>
        </FormGroup>
      </div>);
  }

  selectAssetsButton(cell, row) {
    switch (row.assetSelect) {
      case AssetSelectStatus.SELECT_ASSETS:
        return(<SelectAssetsButton itemID={row.item.id} type={row.status} dispensementID={row.id}
          numAssetsNeeded={row.quantity} assets={row.assets} cb={this} style="primary" name="Select Assets"/>);
        break;
      case AssetSelectStatus.CHANGE_ASSETS:
        return(<SelectAssetsButton itemID={row.item.id} type={row.status} dispensementID={row.id}
          numAssetsNeeded={row.quantity} assets={row.assets} cb={this} style="warning" name="Change Assets"/>);
      break
      default:
        return null;
    }
  }

  renderRequestTable(data, type){
    console.log(data);
    const isStaff = (localStorage.isStaff === "true");
    let canConvert = (this.state.requestData.status === "active") ||
      (isStaff && (this.isOutstanding() ||
      ((this.state.requestData.status === "approved" || this.state.requestData.status === "fulfilled") && type=="loan")));
    let showAssetSelect = isStaff && this.isOutstanding();
    return (
      <BootstrapTable data={data} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
      <TableHeaderColumn dataField='name' width="120px">Name</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity' width="75px" dataAlign="center">Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='returned_quantity' hidden={!(this.state.requestData.status === "fulfilled" && type === "loan")} width="80px" dataAlign="center">{"Returned"}</TableHeaderColumn>
      <TableHeaderColumn dataField='button' dataFormat={this.changeButton} dataAlign="center" hiddenOnInsert columnClassName='my-class'
                        hidden={!canConvert}></TableHeaderColumn>
      <TableHeaderColumn dataField='assetSelect' width="140px" dataFormat={this.selectAssetsButton}
      hidden={!showAssetSelect}></TableHeaderColumn>
      <TableHeaderColumn dataField='is_asset' width="80px" hidden={showAssetSelect || !isStaff}>Asset</TableHeaderColumn>
      </BootstrapTable>
    )
  }

  render() {
    return (
      (this.state.requestData.length !== 0) ?
      <div>
      <SelectAssetsModal cartID={this.state.requestData.id} updateCallback={this}
      ref={(child) => { this._selectAssetsModal = child; }}/>
      <Bootstrap.Modal show={this.state.showModal} onHide={this.closeModal}>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <Modal.Header>
      <Modal.Title>View Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p> <b>Disbursements: </b> </p>
        {this.renderRequestTable(this.state.requestData.cart_disbursements, "disbursement")}
        <p> <b>Loans: </b> </p>
        {this.renderRequestTable(this.state.requestData.cart_loans, "loan")}
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
