//View details for asset
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import {restRequest, checkAuthAndAdmin, handleErrors, handleServerError} from "../Utilities";
import AlertComponent from '../AlertComponent';
import AssetTable from '../Items/AssetTable';
import SelectionType from './SelectionEnum.js'
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
      selectionType: SelectionType.DEFAULT,
      assets: null
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.makeSelection = this.makeSelection.bind(this);
    this.makeRegularSelection = this.makeRegularSelection.bind(this);
    this.makeChangeSelection = this.makeChangeSelection.bind(this);
    this.disableMakeSelection = this.disableMakeSelection.bind(this);
    this.updateNumRowsSelected = this.updateNumRowsSelected.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({enoughAssetsSelected: false});
    this.setState({showModal: false});
    console.log("Clearing asset table selected rows");
    if(this._assetTable != null) {
      this._assetTable.setState({selectedRows: []});
    }
  }

  makeSelection() {
    let selectedAssets = this._assetTable.getSelectedAssets();
    switch (this.state.selectionType) {
      case SelectionType.DISPENSEMENT_TYPE_CHANGE:
        this.makeChangeSelection(selectedAssets);
        break;
      case SelectionType.RETURN:
        this.makeReturn(selectedAssets);
        break;
      default:
        this.clearSelection(()=> {
          this.makeRegularSelection(selectedAssets);
        });
    }
  }

  makeReturn(selectedAssets) {
    for(var i = 0; i < selectedAssets.length; i ++) {
      var requestBody = {
	      "asset_id": selectedAssets[i]
      };
      let jsonResult = JSON.stringify(requestBody);
      restRequest("PATCH", "/api/request/loan/returnAsset/" + this.state.dispensementID + "/", "application/json", jsonResult,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting return loan response");
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

  clearSelection(cb) {
      var requestBody = {
        "current_type" : this.state.type,
        "id" : this.state.dispensementID
      };
      let jsonResult = JSON.stringify(requestBody);

      restRequest("POST", "/api/item/asset/clear", "application/json", jsonResult,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting clear selection response");
        console.log(response);
        cb();
      },
      (status, errResponse)=>{
        handleErrors(errResponse, this._alertchild);
      });
  }

  makeRegularSelection(selectedAssets) {
    for(var i = 0; i < selectedAssets.length; i ++) {
      var requestBody;
      if(this.state.type === "disbursement") {
        requestBody = { "disbursement_id" : this.state.dispensementID };
      } else {
        requestBody = { "loan_id" : this.state.dispensementID };
      }
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
    this.setState({enoughAssetsSelected: (numRows == this.state.numAssetsNeeded)});
  }

  render() {
    return (
      <Bootstrap.Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Body>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <AssetTable lightMode={true} id={this.state.itemID} updateCallback={this}
      selectRowCallback={this} dispensementID={this.state.dispensementID}
      filterType={this.state.type} selectionType={this.state.selectionType}
      preselectedAssets={this.state.assets} ref={(child) => { this._assetTable = child; }}/>
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
