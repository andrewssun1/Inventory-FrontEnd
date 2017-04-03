// ItemTable.js
// The big bad boy. Table for displaying the inventory system.
// @author Andrew Sun

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
import ItemDetail from './ItemDetail';
import TagModal from '../TagModal';
import BulkImportModal from './BulkImportModal';

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import '../DropdownTable.css';
import CartQuantityChooser from "../ShoppingCart/CartQuantityChooser";

import {Button, ButtonGroup} from 'react-bootstrap';

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from '../Utilities';
import AlertComponent from '../AlertComponent';
import TypeConstants from "../TypeConstants.js"

class ItemTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      _products: [{
        "id": 111111111,
        "name": "siva",
        "quantity": null,
        "model_number": "12344567",
        "description": "This is super lit",
        "tags": [{"tag": "first tag"}, {"tag": "second tags"}],
        "quantity_cartitem": 1
      }],
      _fields: [],
      _loginState: true,
      currentSearchURL: null,
      currentPage: 1,
      totalDataSize: 0,
      tagSearchText: "",
      showModal: true,
      alertState: false,
      alertType: "error",
      alertMessage: ""
    };
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.onTagSearchClick = this.onTagSearchClick.bind(this);
    this.cartFormatter = this.cartFormatter.bind(this);
    this.resetTable = this.resetTable.bind(this);
    this.renderColumns = this.renderColumns.bind(this);
    this.openBulkImportModal = this.openBulkImportModal.bind(this);
  }

  getAllItem(url_parameter){
    checkAuthAndAdmin(()=>{
      var url = url_parameter == null ? "/api/item/" : "/api/item/" + url_parameter;
      restRequest("GET", url, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    var response_results = response.results;
                    const isStaff = (localStorage.isStaff === "true");
                    var cartUrl = "/api/request/active/";
                    restRequest("GET", cartUrl, "application/JSON", null,
                                (responseText)=>{
                                  var responseCart = JSON.parse(responseText);
                                  var hash = {};
                                  var disburseRequest = responseCart.cart_disbursements;
                                  var loanRequest = responseCart.cart_loans;
                                  for (var j = 0; j < disburseRequest.length; j++){
                                    var currItem = disburseRequest[j];
                                    hash[currItem.item.id] = [currItem.quantity, currItem.id, "disbursement"];
                                  }
                                  for (var k = 0; k < loanRequest.length; k++){
                                    var currItem = loanRequest[k];
                                    hash[currItem.item.id] = [currItem.quantity, currItem.id, "loan"];
                                  }
                                  for (var i = 0; i < response_results.length; i++){
                                      response_results[i]["tags_data"] = response_results[i].tags;
                                      response_results[i]["tags"] = this.tagsToListString(response_results[i].tags);
                                      if (response_results[i].id in hash){
                                        response_results[i].quantity_cartitem = hash[response_results[i].id][0];
                                        response_results[i].inCart = true;
                                        response_results[i].cartId = hash[response_results[i].id][1];
                                        response_results[i].status = hash[response_results[i].id][2];
                                      }
                                      else{
                                        response_results[i].quantity_cartitem = 1;
                                        response_results[i].inCart = false;
                                      }

                                  }
                                  this.setState({
                                      _products: response_results,
                                      totalDataSize: response.count
                                  }, console.log(this.state._products));
                                }, (status, responseText)=>{console.log(JSON.parse(responseText))});
                  },
                  ()=>{
                    this.setState({
                        _loginState: false
                    });
                  });
    });
  }

  componentWillMount() {
    this.getAllItem(null);
    this.getFieldData();
  }

  resetTable(){
    this.getAllItem();
  }

  // Converts JSON tags to a comma-separated string of tags
  tagsToListString(tags) {
    if(tags == null) {
      return;
    }

    var returnString = "";
    for (var i = 0; i < tags.length; i++){
      returnString = returnString.concat(tags[i].tag);
      if (i < tags.length-1){
        returnString = returnString.concat(", ");
      }
    }
    return returnString;
  }

  // Converts a comma-separated string of tags to a JSON object
  listToTags(s){
    if (!s || s.length === 0){
      return null;
    }
    var splitted = s.split(",");
    var returnList = [];
    for (var i = 0; i < splitted.length; i++){
      var tags = {};
      tags["tag"] = splitted[i].trim();
      returnList.push(tags);
    }
    return returnList;
  }

  addOrUpdateRow(row, requestType, itemID) {
    checkAuthAndAdmin(
      ()=>{
        for (var key in row){
          if (row[key] === ""){
            row[key] = null;
          }
        }
        // Changes row quantity str to int
        row.quantity = parseInt(row.quantity, 10);

        // Deep clone the object so we don't have to convert the tags twice
        var a = JSON.parse(JSON.stringify(row));
        this.state._products.push(row);

        // Formats the row to a JSON object to send to database
        a.tags = this.listToTags(a.tags);
        delete a.id; // deletes id since object does not need it
        var jsonResult = JSON.stringify(a);
        restRequest(requestType, "/api/item/"+itemID, "application/json", jsonResult,
                    (responseText)=>{
                      var response = JSON.parse(responseText);
                      row.id = response.id;
                      row.quantity_cartitem = 1;
                      this._alertchild.generateSuccess("Successfully added " + row.name + " to database.");
                      this.addItemCustomFields(row);
                      this.forceUpdate();
                    }, (status, errResponse)=>{
                      var err = JSON.parse(errResponse);
                      this._alertchild.generateError("Error: " + err.name[0]);
                    });
      }
    );
  }

  addItemCustomFields(row) {
    //Request to get Detailed Item. This is turning into a mess
    restRequest("GET", "/api/item/" + row.id, "application/json", null,
    (responseText)=>{
      var detailedResponse = JSON.parse(responseText);
      //Now that we have the detail:
      //Custom Fields:
      var typesArray = TypeConstants.RequestStrings;
      var responseDataArrays = [detailedResponse.int_fields, detailedResponse.float_fields, detailedResponse.short_text_fields, detailedResponse.long_text_fields];
      for(var i = 0; i < typesArray.length; i++) {
        for(var j = 0; j < responseDataArrays[i].length; j++) {
          this.customFieldRequest(typesArray[i], responseDataArrays[i][j].id, row[responseDataArrays[i][j].field]);
        }
      }
    }, ()=>{console.log('GET Detailed Failed!!');});
  }

  onAddRow(row) {
    this.addOrUpdateRow(row, 'POST', '');
  }

  customFieldRequest(type, id, value) {
    if(value == null) return;
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

  onDeleteRow(rows) {
    checkAuthAndAdmin(()=>{
      for (let i = 0; i < rows.length; i++){
        restRequest("DELETE", "/api/item/"+rows[i], "application/json", null,
                    ()=>{
                      this._alertchild.generateSuccess("Successfully deleted item from database.");
                    }, (status, errResponse)=>{this._alertchild.generateError(JSON.parse(errResponse).detail);});
      }
      this.setState({
        _products: this.state._products.filter((product) => {
          return rows.indexOf(product.id) === -1;
        })
      });
    });
  }

  getFieldData() {
      restRequest("GET", "/api/item/field/", "application/json", null,
      (responseText)=>{
        var response = JSON.parse(responseText);
        console.log("Getting Custom Field Response iin ItemTable");
        console.log(response);
        var results = response.results;
        for(var i = 0; i < results.length; i++) {
          results[i].type = TypeConstants.RequestToFormatMap[results[i].type];
          if(results[i].private) {
            results[i].private = "Private";
          } else {
            results[i].private = "Public";
          }
        }
        this.setState({_fields: response.results});
      },
      ()=>{console.log('GET Failed!!');}
    );
}

  // Makes sure quantity is an integer
  quantityValidator(value) {
    const intValue = parseInt(value, 10);
    if (isNaN(intValue) || String(Math.floor(Number(value))) != value) {
      return 'Quantity must be a integer!';
    } else if (intValue < 0) {
      return 'Quantity must be non-negative!';
    }
    return true;
  }

  // Makes sure name has at least one character
  nameValidator(value) {
    if (!value || value === ""){
      return "Name must be at least one character!"
    }
    return true;
  }

  onRowClick(row, isSelected, e) {
    this.setState({row: row});
    if (this.state.showModal){
      this._child.getDetailedItem(row.id, ()=>{
        this._child.setState({row: row}, ()=>{this._child.openModal();});
      });
    }
    else{
      this.setState({showModal: true});
    }
  }

  onTagSearchClick() {
    this._tagChild.openModal();
  }

    onSearchChange(searchText, colInfos, multiColumnSearch) {
        if(searchText===''){
            this.setState({
                currentSearchURL: null,
                tagSearchText: ""
            });
            this.getAllItem(null);
        }
        else{
            var url_parameter = "?search=" + searchText;
            this.setState({
                currentSearchURL: url_parameter
            });
            this.getAllItem(url_parameter);
        }
    }

    onPageChange(page, sizePerPage) {
        var page_argument = "page=" + page;
        var url_param = this.state.currentSearchURL == null ? "?" + page_argument : this.state.currentSearchURL + "&" + page_argument;
        console.log(url_param);
        this.getAllItem(url_param);
        this.setState({
            currentPage: page
        })
    }

  cartFormatter(cell, row) {
    return (
      <div id="testing" onClick={()=>{this.state.showModal=false;}}>
      <CartQuantityChooser showLabel={true} cb={this} row={row} shouldUpdateCart={row.inCart}></CartQuantityChooser>
      </div>
    );
  }

  openBulkImportModal() {
    this._bulkImportChild.openModal();
  }

  renderColumns() {
    var cols = [];
    cols.push(<TableHeaderColumn key="idCol" isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>);
    cols.push(<TableHeaderColumn key="nameCol" dataField='name' editable={ { validator: this.nameValidator} }>Name</TableHeaderColumn>);
    cols.push(<TableHeaderColumn key="quantityCol" width="120px" dataField='quantity' editable={ { validator: this.quantityValidator} }>Quantity</TableHeaderColumn>);
    cols.push(<TableHeaderColumn key="modelNumberCol" dataField='model_number'>Model Number</TableHeaderColumn>);
    cols.push(<TableHeaderColumn key="descriptionCol" dataField='description'>Description</TableHeaderColumn>);
    cols.push(<TableHeaderColumn key="tagsCol" dataField='tags'>Tags</TableHeaderColumn>);
    cols.push(<TableHeaderColumn key="buttonCol" dataField='button' dataFormat={this.cartFormatter} dataAlign="center" hiddenOnInsert columnClassName='my-class'></TableHeaderColumn>);
    cols.push(<TableHeaderColumn key="tagsDataCol" dataField='tags_data' hidden hiddenOnInsert>tags_data</TableHeaderColumn>);
    cols.push(<TableHeaderColumn key="cartIDCol" dataField='cartId' hidden hiddenOnInsert>cart_id</TableHeaderColumn>);
    for(var i = 0; i < this.state._fields.length; i++) {
      let name = this.state._fields[i].name;
      cols.push(<TableHeaderColumn key={name + "Col"} dataField={name} hidden>{name}</TableHeaderColumn>);
    }
    return cols;
  }

  render() {
    const isStaff = (localStorage.isStaff === "true");
    const isSuperUser = (localStorage.isSuperUser === "true");

    const selectRow = isSuperUser ? {
      mode: 'checkbox' //radio or checkbox
    } : {};

    const options = {
      onAddRow: this.onAddRow,
      onDeleteRow: this.onDeleteRow,
      onRowClick: this.onRowClick,
      onSearchChange: this.onSearchChange.bind(this),
      searchDelayTime: 500,
      clearSearch: true,
      onPageChange: this.onPageChange.bind(this),
      sizePerPageList: [ 30 ],
      sizePerPage: 30,
      page: this.state.currentPage
    };

    return(
      <div>
      {isStaff ? <Button onClick={this.openBulkImportModal} bsStyle="primary">CSV Import/Export</Button> : null}
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <div style={{marginRight: "10px"}} className="text-right">
        <ButtonGroup>
          <Button onClick={this.onTagSearchClick} bsStyle="primary">Search Tags</Button>
        </ButtonGroup>
        <p>{this.state.tagSearchText}</p>
      </div>
      {this.state._loginState ? (<BootstrapTable ref="table1" remote={ true } pagination={ true } options={options}
      fetchInfo={ { dataTotalSize: this.state.totalDataSize } } insertRow={isStaff} selectRow={selectRow}
      data={this.state._products} deleteRow={isSuperUser} search={ true } striped hover>
      {this.renderColumns()}
      </BootstrapTable>) : null}

      <BulkImportModal importCb={this} ref={(child) => {this._bulkImportChild= child; }} />
      <ItemDetail  ref={(child) => { this._child = child; }} updateCallback={this} />
      <TagModal ref={(child) => {this._tagChild = child; }} updateCallback={this}/>
      </div>
    )
  }
}

export default ItemTable;
