// ItemTable.js
// The big bad boy. Table for displaying the inventory system.
// @author Andrew Sun

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
import ItemDetail from './ItemDetail';
import TagModal from '../TagModal';

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import '../DropdownTable.css';
import CartQuantityChooser from "../ShoppingCart/CartQuantityChooser";

import {Button, ButtonGroup} from 'react-bootstrap';

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from '../Utilities';
import AlertComponent from '../AlertComponent';

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
  }

  getAllItem(url_parameter){
    checkAuthAndAdmin(()=>{
      var url = url_parameter == null ? "/api/item/" : "/api/item/" + url_parameter;
      restRequest("GET", url, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    var response_results = response.results;
                    const isStaff = (localStorage.isStaff === "true");
                    var cartUrl = isStaff ? "/api/disburse/active/" : "/api/shoppingCart/active/";
                    restRequest("GET", cartUrl, "application/JSON", null,
                                (responseText)=>{
                                  var responseCart = JSON.parse(responseText);
                                  var hash = {};
                                  var disburseRequest = isStaff ? responseCart.disbursements : responseCart.requests;
                                  for (var j = 0; j < disburseRequest.length; j++){
                                    var currItem = disburseRequest[j];
                                    hash[currItem.item.id] = [currItem.quantity, currItem.id];
                                  }
                                  for (var i = 0; i < response_results.length; i++){
                                      response_results[i]["tags_data"] = response_results[i].tags;
                                      response_results[i]["tags"] = this.tagsToListString(response_results[i].tags);
                                      if (response_results[i].id in hash){
                                        response_results[i].quantity_cartitem = hash[response_results[i].id][0];
                                        response_results[i].inCart = true;
                                        response_results[i].cartId = hash[response_results[i].id][1];
                                      }
                                      else{
                                        response_results[i].quantity_cartitem = 1;
                                        response_results[i].inCart = false;
                                      }

                                  }
                                  this.setState({
                                      _products: response_results,
                                      totalDataSize: response.count
                                  });
                                  console.log(response_results);
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
    this.getAllItem(null)
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
                      this.forceUpdate();
                    }, (status, errResponse)=>{
                      var err = JSON.parse(errResponse);
                      this._alertchild.generateError("Error: " + err.name[0]);
                    })
      }
    );
  }

  onAddRow(row) {
    this.addOrUpdateRow(row, 'POST', '');
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

  // Makes sure quantity is an integer
  quantityValidator(value) {
    const nan = isNaN(parseInt(value, 10));
    if (nan) {
      return 'Quantity must be a integer!';
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
    this._tagchild.openModal();
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


  render() {

    //TODO: Configure options to change cursor when hovering over row
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
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
      <TableHeaderColumn dataField='name' editable={ { validator: this.nameValidator} }>Name</TableHeaderColumn>
      <TableHeaderColumn width="120px" dataField='quantity' editable={ { validator: this.quantityValidator} }>Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='model_number'>Model Number</TableHeaderColumn>
      <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
      <TableHeaderColumn dataField='tags'>Tags</TableHeaderColumn>
      <TableHeaderColumn dataField='button' dataFormat={this.cartFormatter} dataAlign="center" hiddenOnInsert columnClassName='my-class'></TableHeaderColumn>
      <TableHeaderColumn dataField='tags_data' hidden hiddenOnInsert>tags_data</TableHeaderColumn>
      <TableHeaderColumn dataField='cartId' hidden hiddenOnInsert>cart_id</TableHeaderColumn>
      </BootstrapTable>) : null}

      <ItemDetail  ref={(child) => { this._child = child; }} updateCallback={this} />
      <TagModal ref={(child) => {this._tagchild = child; }} updateCallback={this}/>
      </div>
    )
  }
}

export default ItemTable;
