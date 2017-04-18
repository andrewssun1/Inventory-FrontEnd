//Allows users and admins to view requests
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from '../TextEntryFormElement'
import {checkAuthAndAdmin} from "../Utilities";
import {restRequest} from "../Utilities.js"
import TypeConstants from "../TypeConstants.js"
import AlertComponent from "../AlertComponent.js";
import BackfillModal from "../Backfill/BackfillModal";
import BackfillDetailModal from "../Backfill/BackfillDetailModal";
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

class ViewRequestBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      requestData: [],
      requestProblemString: "",
      hasUnselectedAsset: false,
      id: 0
    }
    this.getDetailedRequest = this.getDetailedRequest.bind(this);
    this.assignCartVariables = this.assignCartVariables.bind(this);
    this.isOutstanding = this.isOutstanding.bind(this);
    this.changeRequestType = this.changeRequestType.bind(this);
    this.changeButton = this.changeButton.bind(this);
    this.backfillButton = this.backfillButton.bind(this);
    this.selectAssetsButton = this.selectAssetsButton.bind(this);
    this.renderRequestTable = this.renderRequestTable.bind(this);
    this.renderOutstandingButton = this.renderOutstandingButton.bind(this);
    this.generateHighQuantityTextBox = this.generateHighQuantityTextBox.bind(this);
    this.returnItem = this.returnItem.bind(this);
    this.onDeleteRowLoan = this.onDeleteRowLoan.bind(this);
    this.onDeleteRowDisbursement = this.onDeleteRowDisbursement.bind(this);
    this.didFinishSelection = this.didFinishSelection.bind(this);
    //Modal methods
    this.renderStaffInfo = this.renderStaffInfo.bind(this);
    this.renderBottomComponents = this.renderBottomComponents.bind(this);
    this.isOutstanding = this.isOutstanding.bind(this);
    this.openBackfillModal = this.openBackfillModal.bind(this);
    this.resetTable = this.resetTable.bind(this);
  }

  componentDidMount() {
    this.getDetailedRequest(this.props.id, ()=> {
      if(this.props.parent != null) {
        this.props.parent.bodyHasMounted();
      }
    });
  }

  resetTable(){
    this.componentDidMount();
  }

  isOutstanding() {
    return (this.state.requestData.status === "outstanding");
  }

  didFinishSelection() {
    this.getDetailedRequest(this.state.requestData.id);
  }

  getDetailedRequest(id, cb) {
    checkAuthAndAdmin(()=>{
      this.setState({hasUnselectedAsset: false});
      if(this.props.parent != null) {
        this.props.parent.setState({bodyHasUnselectedAsset: false});
      }
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
        if(this.props.parent != null) {
          this.props.parent.setState({bodyHasUnselectedAsset: true});
        }
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

  isOutstanding() {
    return (this.state.requestData.status === "outstanding");
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
                  this._alertchild.generateSucess("Successfully converted to " + row.status);
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
                          this.props._alertchild.generateError("Invalid. Must be integer!!!!");
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
                this._alertchild.generateSuccess("Successfully returned");
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
        row.changeQuantity = row.max_return_quantity;
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
    const tooltip = (
      <Tooltip id="tooltip">{"Change specified quantity to " + (row.status === "disbursement" ? "loan" : "disbursement")}</Tooltip>
    );
    return (
      <div>
      {this.generateHighQuantityTextBox(row)}
      <OverlayTrigger placement="bottom" overlay={tooltip}>
      <Button bsSize="xsmall" style={{marginLeft: "5px", marginTop: "1px", fontSize: "9.5px"}}
              bsStyle="primary"
              onClick={()=>{this.changeRequestType(row)}}>
              <strong> Swap </strong>
              </Button>
          </OverlayTrigger></div>
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

  openBackfillModal(row){
    this._backfillchild.openModal(row);
  }

  backfillButton(cell, row){
    // open modal to show backfill table
    const isStaff = (localStorage.isStaff === "true");
    // console.log(row);
    return(
      <div>
      {(row.backfill_loan != null && row.backfill_loan.length > 0) ? <Button onClick={()=>{this._backfillDetailChild.openModal(row)}}>View</Button> : null}
      {(row.returned_timestamp == null && this.state.requestData.status === "fulfilled" && !isStaff) ? <Button bsStyle="primary" onClick={()=>{this.openBackfillModal(row)}}>Create</Button> : null}
      </div>
    )
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

  onDeleteRowLoan(rows) {
    this.props.activeCartParent.onDeleteRow(rows, "loan");
  }

  onDeleteRowDisbursement(rows) {
    this.props.activeCartParent.onDeleteRow(rows, "disbursement");
  }

  renderRequestTable(data, type){
    if(data==null || data == []) return null;
    const isStaff = (localStorage.isStaff === "true");

    //Logic for what columns to show
    let canConvert = (this.state.requestData.status === "active") ||
      (isStaff && (this.isOutstanding() ||
      ((this.state.requestData.status === "approved" || this.state.requestData.status === "fulfilled") && type=="loan")));
    let showAssetSelect = isStaff && (this.isOutstanding());

    return (
      <BootstrapTable data={data} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
      <TableHeaderColumn dataField='name' width="120px">Name</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity' width="75px" dataAlign="center">Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='returned_quantity' hidden={!(this.state.requestData.status === "fulfilled" && type === "loan")} width="80px" dataAlign="center">{"Returned"}</TableHeaderColumn>
      <TableHeaderColumn dataField='total_backfill_quantity'
      hidden={!(this.state.requestData.status === "outstanding" && type === "loan")}
      width="120px" dataAlign="center">Backfills Requested</TableHeaderColumn>
      <TableHeaderColumn dataField='button1' width="150px" dataFormat={this.backfillButton} dataAlign="center" hiddenOnInsert columnClassName='my-class'
                            hidden={type !== "loan"}>Backfills</TableHeaderColumn>
      <TableHeaderColumn dataField='button' dataFormat={this.changeButton} dataAlign="center" hiddenOnInsert columnClassName='my-class'
                        hidden={!canConvert}></TableHeaderColumn>
      <TableHeaderColumn dataField='assetSelect' width="140px" dataFormat={this.selectAssetsButton}
      hidden={!showAssetSelect}></TableHeaderColumn>
      <TableHeaderColumn dataField='is_asset' width="80px" hidden={showAssetSelect || !isStaff}>Asset</TableHeaderColumn>
      </BootstrapTable>
    )
  }

  //Modal methods

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
    switch (data.status) {
      case "approved":
      case "denied":
        return(
          <div>
          {(data.status === "approved") ? <h4><Label bsStyle="success"> Approved </Label></h4> : <h4><Label bsStyle="danger"> Denied </Label></h4>}
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

  render() {
    //if(this.state.requestData.length == 0) return null;
    return (
      <div>
      <BackfillDetailModal ref={(child) => { this._backfillDetailChild = child; }} requestState={this.state.requestData.status}></BackfillDetailModal>
      <BackfillModal ref={(child) => {this._backfillchild = child; }} cb={this}/>
      <SelectAssetsModal cartID={this.state.requestData.id} updateCallback={this}
      ref={(child) => { this._selectAssetsModal = child; }}/>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
        <p style={{color:"red"}}> {this.state.requestProblemString} </p>
        <p> <b>Disbursements: </b> </p>
        {this.renderRequestTable(this.state.requestData.cart_disbursements, "disbursement")}
        <p> <b>Loans: </b> </p>
        {this.renderRequestTable(this.state.requestData.cart_loans, "loan")}
          <div>
          <br />
          <p> <b>Request Reason: </b>{this.state.requestData.reason} </p>
          {this.renderBottomComponents()}
          </div>
      </div>
    )
  }
}

export default ViewRequestBody
