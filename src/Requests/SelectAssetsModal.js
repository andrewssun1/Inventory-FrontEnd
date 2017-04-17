//View details for asset
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import {restRequest, checkAuthAndAdmin, handleErrors, handleServerError} from "../Utilities";
import AlertComponent from '../AlertComponent';
import AssetTable from '../Items/AssetTable';
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;

class SelectAssetsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      itemID: 0,
      type: null,
      dispensementID: 0,
      numAssetsNeeded: 0,
      enoughAssetsSelected:false,
      isChangingCartType: false
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.makeSelection = this.makeSelection.bind(this);
    this.makeRegularSelection = this.makeRegularSelection.bind(this);
    this.makeChangeSelection = this.makeChangeSelection.bind(this);
    this.disableMakeSelection = this.disableMakeSelection.bind(this);
    this.updateNumRowsSelected = this.updateNumRowsSelected.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({enoughAssetsSelected: false});
    this.setState({isChangingCartType: false});
    this.setState({showModal: false});
  }

  makeSelection() {
    let selectedAssets = this._assetTable.getSelectedAssets();
    if(this.state.isChangingCartType) {
      this.makeChangeSelection(selectedAssets);
    } else {
      this.makeRegularSelection(selectedAssets);
    }
  }

  makeRegularSelection(selectedAssets) {
    console.log(selectedAssets);
    for(var i = 0; i < selectedAssets.length; i ++) {
      var requestBody;
      if(this.state.type === "disbursement") {
        requestBody = { "disbursement_id" : this.state.dispensementID };
      } else {
        requestBody = { "loan_id" : this.state.dispensementID };
      }
      console.log(requestBody);
      let jsonResult = JSON.stringify(requestBody);
      restRequest("PATCH", "/api/item/asset/" + selectedAssets[i], "application/json", jsonResult,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting make selection response");
        console.log(response);
        this.closeModal();
        this.props.updateCallback.getDetailedRequest(this.props.cartID);
      },
      (status, errResponse)=>{
        handleErrors(errResponse, this._alertchild);
      }
      );
    }
  }

  makeChangeSelection(selectedAssets) {
    console.log(selectedAssets);
    console.log(this.state.dispensementID);
    for(var i = 0; i < selectedAssets.length; i ++) {
      var requestBody = {
        "current_type": this.state.type,
	      "pk": this.state.dispensementID,
	      "asset_id": selectedAssets[i]
      };
      let jsonResult = JSON.stringify(requestBody);
      restRequest("POST", "/api/request/convertRequestType/", "application/json", jsonResult,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting change selection loan/disbursement response");
        console.log(response);
        this.closeModal();
        this.props.updateCallback.getDetailedRequest(this.props.cartID);
      },
      (status, errResponse)=>{
        handleErrors(errResponse, this._alertchild);
      }
      );
    }
  }

  disableMakeSelection() {
    if(this._assetTable == null) {
      return true;
    } else {
      return (this._assetTable._table.state.selectedRowKeys.length > 0);
    }
  }

  updateNumRowsSelected(numRows) {
    console.log(numRows);
    console.log(this.state.numAssetsNeeded);
    this.setState({enoughAssetsSelected: (numRows == this.state.numAssetsNeeded)});
  }

  render() {
    var filterID = 0;
    if(this.state.isChangingCartType) {
      filterID = this.state.dispensementID;
    }
    return (
      <Bootstrap.Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Body>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <AssetTable lightMode={true} id={this.state.itemID} updateCallback={this}
      selectRowCallback={this} dispensementID={this.state.dispensementID}
      filterType={this.state.type} isChangingCartType={this.state.isChangingCartType}
      ref={(child) => { this._assetTable = child; }}/>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.makeSelection}
        disabled={!this.state.enoughAssetsSelected}
        bsStyle="primary">Make Selection</Button>
        <Button onClick={this.closeModal} bsStyle="danger">Cancel</Button>
      </Modal.Footer>
      </Bootstrap.Modal>
    )
  }
}

export default SelectAssetsModal
