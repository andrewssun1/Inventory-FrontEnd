//Displays detail modal with all properties of an ItemDetail
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
var ReactBsTable = require('react-bootstrap-table');
import TextEntryFormElement from '../TextEntryFormElement';
import MakeRequestModal from '../Requests/MakeRequestModal';
import ViewRequestModal from '../Requests/ViewRequestModal';
import TagComponent from '../Tags/TagComponent';
import TypeConstants from '../TypeConstants';
import LogQuantityChangeModal from './LogQuantityChangeModal';
import LogComponent from '../Logs/LogComponent';
import AssetTable from './AssetTable';
import FieldViewerAndEditor from './FieldViewerAndEditor';
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;
var moment = require('moment');
var fileDownload = require('react-file-download');

import {restRequest, checkAuthAndAdmin} from "../Utilities.js";
import CartQuantityChooser from '../ShoppingCart/CartQuantityChooser';
import AlertComponent from '../AlertComponent';
import Select from 'react-select';
import BackfillDetailTable from '../Backfill/BackfillDetailTable';

class ItemDetail extends React.Component {

  constructor(props) {
    super(props);
    this.refDict = {};
    this.state = {
      showModal: false,
      isEditing: false,
      itemData: null,
      selectedRequest: null,
      fieldData: null,
      cartData: [],
      row: [],
      showCartChange: true,
      isAsset: false,
      id: null,
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.saveEdits = this.saveEdits.bind(this);
    this.requestItem = this.requestItem.bind(this);
    this.getCarts = this.getCarts.bind(this);
    this.getDetailedItem = this.getDetailedItem.bind(this);
    this.populateFieldData = this.populateFieldData.bind(this);
    this.renderDisplayFields = this.renderDisplayFields.bind(this);
    this.renderEditFields = this.renderEditFields.bind(this);
    this.logItemQuantityChange = this.logItemQuantityChange.bind(this);
    this.onRowClickCart = this.onRowClickCart.bind(this);
    this.clearAlert = this.clearAlert.bind(this);
    this.exportAssets = this.exportAssets.bind(this);
  }

  getDetailedItem(id, cb) {
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/item/"+id, "application/json", null,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting Detailed Item Response");
        console.log(response);
        //Handle assets:
        for (var i = 0; i < response.backfill_requested.length; i++) {
          response.backfill_requested[i].timestamp = moment(response.backfill_requested[i].timestamp).format('lll');
        }
        for (var j = 0; j < response.backfill_transit.length; j++) {
          response.backfill_transit[j].timestamp = moment(response.backfill_transit[j].timestamp).format('lll');
        }
        this.setState({isAsset: response.is_asset});
        this.setState({id: response.id});
        this.setState({itemData: response}, ()=>{
          if (cb != null){
            cb();
          }
        });
        this.populateFieldData(response);
        this.getCarts(response.name);
        //this.refs.tagComponent.refs.tagTable.forceUpdate();
      },
      ()=>{console.log('GET Failed!!');}
    );
  });
}

populateFieldData(response) {
  //Default Fields:
  var data = [
    {name: "Name", type: TypeConstants.Enum.SHORT_STRING, value: response.name},
    {name: "Quantity Available", type: TypeConstants.Enum.INTEGER, value: response.quantity, isImmutable: (localStorage.isSuperUser !== "true" || this.state.isAsset)},
    {name: "Model Number", type: TypeConstants.Enum.SHORT_STRING, value: response.model_number},
    {name: "Description", type: TypeConstants.Enum.LONG_STRING, value: response.description},
  ];
  if(localStorage.isStaff === "true"){
      data.push({name: "Minimum Stock", type: TypeConstants.Enum.INTEGER, value: response.minimum_stock})
  }
  this._fieldViewerAndEditor.populateFieldData(response);
  this.setState({fieldData: data});
}

saveItem() {
  checkAuthAndAdmin(()=>{
    var requestBody;
    var isAssetString = "true";
    if(this._isAssetSelect != null) {
      isAssetString = this._isAssetSelect.state.value;
    }
    console.log(isAssetString);
    console.log(this.refDict);
    if(localStorage.isSuperUser === "true") {
      requestBody = {
        "name": this.refDict["Name"].state.value,
        "model_number": this.refDict["Model Number"].state.value,
        "description": this.refDict["Description"].state.value,
        "minimum_stock": this.refDict['Minimum Stock'].state.value,
        "track_minimum_stock": this.refDict['Minimum Stock'].state.value > 0,
        "is_asset": isAssetString
      };
      if (!this.state.isAsset){
        requestBody["quantity"] = this.refDict["Quantity Available"].state.value
      }
    } else {
      requestBody = {
        "name": this.refDict["Name"].state.value,
        "model_number": this.refDict["Model Number"].state.value,
        "description": this.refDict["Description"].state.value,
        "minimum_stock": this.refDict['Minimum Stock'].state.value,
        "track_minimum_stock": this.refDict['Minimum Stock'].state.value > 0,
        "is_asset": isAssetString
      }
    }

    var jsonResult = JSON.stringify(requestBody);
    restRequest("PATCH", "/api/item/" + this.state.itemData.id, "application/json", jsonResult,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Response");
      console.log(response);
      this.toggleEditing();
      this.clearAlert();
    },
    (status, errResponse)=>{
      let errs = JSON.parse(errResponse);
      console.log('PATCH Failed!!');
      if(errs.quantity != null) {
        for(var i = 0; i < errs.quantity.length; i ++) {
          this._alertchild.generateError(errs.quantity[i]);
        }
      }
    });
    this._fieldViewerAndEditor.saveCustomFields();
    //Update detailed item data:
    this.getDetailedItem(this.state.itemData.id);
  });
}

getCarts(item_name){
  // GET request to get all outstanding carts for this item by this user
  restRequest("GET", "/api/request/?status=outstanding&requests__item__name=" + item_name, "application/json", null,
  (responseText)=>{
    var response = JSON.parse(responseText);
    console.log(response);
    var results = ItemDetail.editGetResponse(response.results);
    this.setState({
      cartData: results
    });
  }, ()=>{console.log('GET Failed!!');});
}

static editGetResponse(data) {
  for(var index=0; index< data.length; index++){
    data[index]['username'] = data[index].owner === null ? 'UNKNOWN USER' : data[index].owner;
    data[index]['timestamp'] = moment(data[index].timestamp).format('lll');
  }
  return data;
}

exportAssets() {
  restRequest("GET","/api/item/asset/csv/export?item_id=" + this.state.itemData.id, "application/json", null,
              (responseText)=>{
                console.log("Successfully got assets");
                fileDownload(responseText, this.state.itemData.name + 'Assets.csv');
              }, (status, errResponse)=>{
                console.log('Failed to get assets');
              });
}

openModal() {
  this.setState({showModal: true}, ()=>{});
}

closeModal() {
  console.log("closeModal called");
  if(this.state.isEditing) {
    this.toggleEditing();
  }
  if (typeof this.props.updateCallback.componentWillMount === "function") {
    this.props.updateCallback.componentWillMount();
  }
  if(this.props.updateCallback._minStockFilter != null) {
        console.log("Cleaning filter");
        this.props.updateCallback._minStockFilter.cleanFiltered();
  }
  this.setState({showModal: false});
}

toggleEditing() {
  if(!this.state.isEditing) {
    this.renderEditFields();
  }
  this.setState({isEditing: !this.state.isEditing});
}

saveEdits() {
  var r = confirm("Are you sure you want to save?");
  if (r) {
    this.saveItem();
  }
}

requestItem() {
  this._requestModal.openModal();
}

logItemQuantityChange() {
  this.closeModal();
  this._lqcModal.openModal();
}

onRowClickCart(row, isSelected, e) {
  this._viewRequestModal.setState({id: row.cart_id});
  this._viewRequestModal.openModal();
}

clearAlert() {
  this._alertchild.setState({showAlert: false});
  this._alertchild.setState({alertMessage: ""});
}

renderDisplayFields() {
  if(this.state.fieldData != null) {
    let displayFields = this.state.fieldData.map((field) => {
      return(<p key={field.name}> <b>{field.name}:</b> {field.value} </p>);
    });
    displayFields.push(
      <div key="tagComponent">
      <p><b>Tags: </b></p>
      <TagComponent ref="tagComponent" cb={this} item_id={this.state.itemData.id} item_detail={this.state.itemData.tags} />
      </div>);
      if(localStorage.isStaff === "true"){
        displayFields.push(<p key="isAsset"> <b> Is Asset: </b> {this.state.isAsset ? "True" : "False"} </p>);
      }
      return (displayFields);
    }
  }

  renderEditFields() {
    if(this.state.fieldData != null) {
      console.log(this.state.fieldData);
      let editFields = this.state.fieldData.map((field) => {
        if(field.isImmutable) {
          return null;
        } else {
          return(<TextEntryFormElement key={field.name} controlId={"formHorizontal" + field.name}
          label={field.name} type={field.type} initialValue={field.value}
          ref={child => this.refDict[field.name] = child}/>);
        }
      });
      //TODO: Fix placeholder bug
      if(localStorage.isStaff === "true" && !this.state.isAsset) {
        editFields.push(<TextEntryFormElement key="isAsset"  label="Is Asset"
        type={TypeConstants.Enum.SELECT} selectOptions={["false", "true"]} placeholder="false"
        initialValue="false" ref={child => this._isAssetSelect = child}/>);
      }

      return(editFields);
    }
  }

  generateItemStackTable(data){
    const cartTableOptions = {
      onRowClick: this.onRowClickCart
    };
    return(
      <BootstrapTable ref="logTable"
      data={ data }
      options={ cartTableOptions }
      striped hover>
      <TableHeaderColumn dataField='cart_id' isKey hidden>cart_id</TableHeaderColumn>
      <TableHeaderColumn dataField='cart_owner'>Requesting User</TableHeaderColumn>
      <TableHeaderColumn dataField='status' hidden>Status</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity' >Quantity</TableHeaderColumn>
      </BootstrapTable>
    );
  }

  testOnHide() {
    console.log("TEST ON HIDE");
  }

  render() {
    if(this.state.itemData == null) return null;

    const isStaff = (localStorage.isStaff === "true");

    //TODO: Fix weird close modal bug when adding asset, fix scrolling problem

    return (
      <div>
      <MakeRequestModal item_id={this.state.itemData.id} item={this.state.itemData.name} ref={(child) => { this._makeRequestModal = child; }} />
      <LogQuantityChangeModal item_id={this.state.itemData.id} item={this.state.itemData.name}
      updateCallback={this.props.updateCallback} ref={(child) => { this._lqcModal = child; }} />
      <ViewRequestModal id={this.state.selectedRequest} ref={(child) => { this._viewRequestModal = child; }} updateCallback={this.props.updateCallback} />
      <Bootstrap.Modal bsSize="large" show={this.state.showModal} onHide={this.closeModal}>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <Modal.Header>
      <Modal.Title>View Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {this.state.isEditing ?
        <Form horizontal ref={(child) => { this._editForm = child; }}>
        {this.renderEditFields()}
        </Form>
        :
        this.renderDisplayFields()
      }

      <FieldViewerAndEditor apiSource="/api/item/field/" isEditing={this.state.isEditing} ref={(child) => { this._fieldViewerAndEditor = child; }}/>

      {this.state.isEditing ?
        null
        :
        <div>
        {(isStaff && this.state.id != null && this.state.isAsset) ?
        <div>
        <AssetTable id={this.state.id} updateCallback={this}/>
        <Button onClick={this.exportAssets} bsStyle="primary">Export Assets</Button>
        </div>
        : null}
        <br />
        <p><b>Outstanding disbursements containing this item: </b></p>
        {this.generateItemStackTable(this.state.itemData.outstanding_disbursements)}
        <p><b>Outstanding loans containing this item: </b></p>
        {this.generateItemStackTable(this.state.itemData.outstanding_loans)}
        <p><b>Current loans containing this item: </b></p>
        {this.generateItemStackTable(this.state.itemData.current_loans)}
        <p><b>Backfills involving this item: </b></p>
        <BackfillDetailTable cb={this} data={this.state.itemData.backfill_requested.concat(this.state.itemData.backfill_transit)} />
        {isStaff ?
          <div>
          <b> Logs involving this item: </b>
          <LogComponent lightMode={true} itemFilter={this.state.itemData.name}> </LogComponent>
          </div>
          : null}
          </div>
        }
        </Modal.Body>
        <Modal.Footer>
        {isStaff ?
          this.state.isEditing ?
          //Buttons for an admin in editing mode
          <div>
          <Button onClick={this.saveEdits} bsStyle="primary">Save</Button>
          <Button onClick={this.toggleEditing} bsStyle="danger">Cancel</Button>
          </div>
          :
          //Buttons for an admin in viewing mode
          <div>
          {this.state.showCartChange ?
            <CartQuantityChooser showLabel={true} disburse={true} cb={this} row={this.state.row} shouldUpdateCart={this.state.row.inCart}></CartQuantityChooser>
            : null}
            <Button onClick={this.logItemQuantityChange} bsStyle="info">Log</Button>
            <Button onClick={this.toggleEditing} bsStyle="primary">Edit</Button>
            <Button onClick={this.closeModal} bsStyle="danger">Close</Button>
            </div>
            :
            //Buttons for a user
            <div>
            {this.state.showCartChange ?
              <CartQuantityChooser showLabel={true} cb={this} row={this.state.row} shouldUpdateCart={this.state.row.inCart}></CartQuantityChooser> :
              null
            }
            <Button onClick={this.closeModal} bsStyle="danger">Close</Button>
            </div>
          }
          </Modal.Footer>
          </Bootstrap.Modal>
          </div>
        )
      }
    }

    export default ItemDetail
