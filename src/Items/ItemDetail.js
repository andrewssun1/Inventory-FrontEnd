//Displays detail modal with all properties of an ItemDetail
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
var ReactBsTable = require('react-bootstrap-table');
import TextEntryFormElement from '../TextEntryFormElement';
import MakeRequestModal from '../Requests/MakeRequestModal';
import ViewRequestModal from '../Requests/ViewRequestModal';
import TagComponent from '../Tags/TagComponent'
import TypeConstants from '../TypeConstants';
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;

import {restRequest, checkAuthAndAdmin} from "../Utilities.js"
import {MenuItem, DropdownButton, FormControl, FormGroup, InputGroup} from 'react-bootstrap';
import CartQuantityChooser from '../ShoppingCart/CartQuantityChooser'
import AlertComponent from '../AlertComponent'

class ItemDetail extends React.Component {

  constructor(props) {
    super(props);
    this.refDict = {};
    this.state = {
      showModal: false,
      isEditing: false,
      itemData: null,
      outstandingRequests: null,
      fieldData: null,
      row: []
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.saveEdits = this.saveEdits.bind(this);
    this.requestItem = this.requestItem.bind(this);
    this.getRequests = this.getRequests.bind(this);
    this.getDetailedItem = this.getDetailedItem.bind(this);
    this.populateFieldData = this.populateFieldData.bind(this);
    this.renderDisplayFields = this.renderDisplayFields.bind(this);
    this.renderEditFields = this.renderEditFields.bind(this);
    this.customFieldRequest = this.customFieldRequest.bind(this);
    this.typeCheck = this.typeCheck.bind(this);
  }

  getDetailedItem(id, cb) {
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/item/"+id, "application/json", null,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting Detailed Item Response");
        console.log(response);
        this.setState({itemData: response}, ()=>{
          if (cb != null){
            cb();
          }
        });
        this.populateFieldData(response);
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
    {name: "Quantity", type: TypeConstants.Enum.INTEGER, value: response.quantity},
    {name: "Model Number", type: TypeConstants.Enum.SHORT_STRING, value: response.model_number},
    {name: "Description", type: TypeConstants.Enum.LONG_STRING, value: response.description}
  ];
  //Custom Fields:
  var typesArray = TypeConstants.Array;
  console.log("printing response arrays");
  var responseDataArrays = [response.int_fields, response.float_fields, response.short_text_fields, response.long_text_fields];
  for(var i = 0; i < typesArray.length; i++) {
    console.log(responseDataArrays[i]);
    for(var j = 0; j < responseDataArrays[i].length; j++) {
      var field = responseDataArrays[i][j];
      data.push({name: field.field, type: typesArray[i], value: field.value});
    }
  }
  this.setState({fieldData: data});
}

saveItem(cb) {
  checkAuthAndAdmin(()=>{
    var requestBody = {
      "name": this.refDict["Name"].state.value,
      "quantity": this.refDict["Quantity"].state.value,
      "model_number": this.refDict["Model Number"].state.value,
      "description": this.refDict["Description"].state.value
    }
    var jsonResult = JSON.stringify(requestBody);
    restRequest("PATCH", "/api/item/" + this.state.itemData.id, "application/json", jsonResult,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Response");
      console.log(response);
      cb();
    },
    ()=>{
      console.log('PATCH Failed!!');
    });

    //Save Custom Fields
    var itemDataArrays = [this.state.itemData.int_fields,
      this.state.itemData.float_fields,
      this.state.itemData.short_text_fields,
      this.state.itemData.long_text_fields];
      var types = TypeConstants.RequestStrings;
      for(var i = 0; i < itemDataArrays.length; i++) {
        var oldFields = itemDataArrays[i];
        for(var j = 0; j < oldFields.length; j++) {
          var newValue = this.refDict[oldFields[j].field].state.value;
          if(oldFields[j].value != newValue && this.typeCheck(newValue, types[i])) {
            this.customFieldRequest(types[i], oldFields[j].id, newValue);
          }
        }
      }
      //Update detailed item data:
      this.getDetailedItem(this.state.itemData.id);
    });
  }

  typeCheck(value, type) {
    return (type == 'short_text' || type == 'long_text' || value != "");
  }

  getRequests(item_name){
    // GET request to get all outstanding requests for this item by this user
    var url;
    if (localStorage.isAdmin === "true") {
      url = "/api/request/?item__name="+item_name+"&status=outstanding";
    } else {
      url = "/api/request/?item__name="+item_name+"&status=outstanding";
    }
    restRequest("GET", url, "application/json", null,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log(response);
      var response_results = response.results;
      for (var i = 0; i < response_results.length; i++){
        response_results[i]["item"] = response_results[i].item.name;
      }
      this.setState({
        outstandingRequests: response.results,
        totalDataSize: response.count
      });
    }, ()=>{console.log('GET Failed!!');});
  }

  customFieldRequest(type, id, value) {
    var requestBody = {
      "value": value
    }
    var jsonResult = JSON.stringify(requestBody);
    restRequest("PATCH", "/api/item/field/" + type + "/" + id, "application/json", jsonResult,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Response");
      console.log(response);
    },
    ()=>{
      console.log('PATCH Failed!!');
    });
  }

  openModal() {
    //this.state.showModal = true;
    this.setState({showModal: true}, ()=>{});
  }

  closeModal() {
    if(this.state.isEditing) {
      this.toggleEditing();
    }
    this.props.updateCallback.componentWillMount();
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
      this.saveItem(()=>{
        this.props.updateCallback.componentWillMount();
        this.toggleEditing();
      });
    }
  }

  requestItem() {
    this.closeModal();
    this._requestModal.openModal();
  }

  renderDisplayFields() {
    if(this.state.fieldData != null) {
      let displayFields = this.state.fieldData.map((field) => {
        return(<p key={field.name}> {field.name} : {field.value} </p>);
      });
      return (displayFields);
    }
  }

  renderEditFields() {
    if(this.state.fieldData != null) {
      console.log(this.state.fieldData);
      let editFields = this.state.fieldData.map((field) => {
        return(<TextEntryFormElement key={field.name} controlId={"formHorizontal" + field.name}
        label={field.name} type={field.type} initialValue={field.value}
        ref={child => this.refDict[field.name] = child}/>);
      });
      return(editFields);
    }
  }

  render() {
    if(this.state.itemData == null) return null;

    const isAdmin = (localStorage.isAdmin === "true");

    const options = {
      sizePerPageList: [ 30 ],
      sizePerPage: 30,
      page: this.state.currentPage
    };

    return (
      <div>
      <MakeRequestModal item_id={this.state.itemData.id} item={this.state.itemData.name} ref={(child) => { this._requestModal = child; }} />
      <Bootstrap.Modal show={this.state.showModal}>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <Modal.Body>
      {this.state.isEditing ?
        <Form horizontal ref={(child) => { this._editForm = child; }}>
        {this.renderEditFields()}
        </Form>
        :
        <div>
        {this.renderDisplayFields()}
        <p> Tags: </p>
        <TagComponent ref="tagComponent" item_id={this.state.itemData.id} item_detail={this.state.itemData.tags}/>
        <br />
        {/*<h4> Requests </h4>
        <BootstrapTable ref="table1" remote={ true } pagination={ true } options={options} insertRow={false}
        data={this.state.outstandingRequests} deleteRow={false} search={false} striped hover>
        <TableHeaderColumn dataField='id' isKey hidden autoValue="true">Id</TableHeaderColumn>
        <TableHeaderColumn dataField='item' width="120px">Item</TableHeaderColumn>
        <TableHeaderColumn dataField='quantity' width="50px">Quantity</TableHeaderColumn>
        <TableHeaderColumn dataField='status' width="100px">Status</TableHeaderColumn>
        <TableHeaderColumn dataField='timestamp' width="150px">Timestamp</TableHeaderColumn>
        <TableHeaderColumn dataField='reason' width="200px">Reason</TableHeaderColumn>
        </BootstrapTable>*/}
        </div>
      }
      </Modal.Body>
      <Modal.Footer>
      {isAdmin ?
        this.state.isEditing ?
        //Buttons for an admin in editing mode
        <div>
        <Button onClick={this.saveEdits} bsStyle="primary">Save</Button>
        <Button onClick={this.toggleEditing} bsStyle="danger">Cancel</Button>
        </div>
        :
        //Buttons for an admin in viewing mode
        <div>
        <Button onClick={this.requestItem} bsStyle="success">Disburse</Button>
        <Button onClick={this.toggleEditing} bsStyle="primary">Edit</Button>
        <Button onClick={this.closeModal} bsStyle="danger">Close</Button>
        </div>
        :
        //Buttons for a user
        <div>
        <CartQuantityChooser showLabel={true} cb={this} row={this.state.row} shouldUpdateCart={this.state.row.inCart}></CartQuantityChooser>
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
