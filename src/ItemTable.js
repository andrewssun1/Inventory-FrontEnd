// bootstraptable.js
// Example to create a simple table using React Bootstrap table
// @author Andrew Sun

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var Bootstrap = require('react-bootstrap');
import ItemDetail from './ItemDetail';

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import {Modal, Button, Form, FormGroup, Col, ControlLabel, FormControl} from 'react-bootstrap';

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin } from './Utilities';

var xhttp = new XMLHttpRequest();

class ItemTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      row: null,
      _products: [{
        "id": 111111111,
        "name": "siva",
        "quantity": null,
        "model_number": "12344567",
        "description": "This is super lit",
        "location": "Hudson",
        "tags": [{"tag": "first tag"}, {"tag": "second tag"}]
      }],
      _loginState: true,
      currentSearchURL: null
    };
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
  }

  getAllItem(url_parameter){
      if (checkAuthAndAdmin()){
          // GET request to get all items from database
          var url = url_parameter == null ? "https://asap-test.colab.duke.edu/api/item/" : "https://asap-test.colab.duke.edu/api/item/" + url_parameter;
          xhttp.open("GET", url, false);
          xhttp.setRequestHeader("Content-Type", "application/json");
          xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
          xhttp.send();
          var response = JSON.parse(xhttp.responseText);

          // Since setState is async, need to pass it a callback function
          this.setState({
              _products: response.results
          }, () => {
              for (var i = 0; i < this.state._products.length; i++){
                  // console.log(this.tagsToListString(this.state._products[i].tags));
                  this.state._products[i]["tags"] = this.tagsToListString(this.state._products[i].tags);
              }
          });
      }
      // auth failed
      else{
          this.setState({
              _loginState: false
          });
      }
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
    if (row){ // should we check for auth/admin here? yes right?
      xhttp.open(requestType, "https://asap-test.colab.duke.edu/api/item/" + itemID, false);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
      if (xhttp.status === 401 || xhttp.status === 500){
        console.log('POST Failed!!');
      }
      // POST request able to continue
        else{
          // If the value of the item is empty, we need to
          // set it to null instead of empty string (defined by the database)
          for (var key in row){
            if (row[key] === ""){
              row[key] = null;
            }
          }
          // Changes row quantity str to int
          row.quantity = parseInt(row.quantity);

          // Deep clone the object so we don't have to convert the tags twice
          var a = JSON.parse(JSON.stringify(row));
          this.state._products.push(row);

          // Formats the row to a JSON object to send to database
          a.tags = this.listToTags(a.tags);
          delete a.id; // deletes id since object does not need it
          var jsonResult = JSON.stringify(a);

          // Send the row and parse the response
          xhttp.send(jsonResult);
          var response = JSON.parse(xhttp.responseText);
          row.id = response.id;
      }
    }
    // console.log(this.state._products);
  }

  onAddRow(row) {
    this.addOrUpdateRow(row, 'POST', '');
  }

  onDeleteRow(rows) {
    if(checkAuthAndAdmin() && rows){
      for (var i = 0; i < rows.length; i++){
        xhttp.open("DELETE", "https://asap-test.colab.duke.edu/api/item/"+rows[i], false);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        xhttp.send();
      }
      this.setState({
        _products: this.state._products.filter((product) => {
          return rows.indexOf(product.id) === -1;
        })
      })
    }
    // console.log(rows);
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
    this._child.openModal();
  }

    onSearchChange(searchText, colInfos, multiColumnSearch) {
        if(searchText==''){
            this.setState({
                currentSearchURL: null
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

  render() {

    //TODO: Configure options to change cursor when hovering over row

    const isAdmin = (localStorage.isAdmin == "true");

    const selectRow = isAdmin ? {
      mode: 'checkbox' //radio or checkbox
    } : {};

    const options = {
      onAddRow: this.onAddRow,
      onDeleteRow: this.onDeleteRow,
      onRowClick: this.onRowClick,
      onSearchChange: this.onSearchChange.bind(this),
      searchDelayTime: 500,
      clearSearch: true,
    };

    return(
      <div>
      {this.state._loginState ? (<BootstrapTable ref="table1" options={options} insertRow={isAdmin} selectRow={selectRow} data={this.state._products} deleteRow={isAdmin} search={ true } striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
      <TableHeaderColumn dataField='name' editable={ { validator: this.nameValidator} }>Name</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity' editable={ { validator: this.quantityValidator} }>Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='model_number'>Model Number</TableHeaderColumn>
      <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
      <TableHeaderColumn dataField='location'>Location</TableHeaderColumn>
      <TableHeaderColumn dataField='tags'>Tags</TableHeaderColumn>
      </BootstrapTable>) : null}

      <ItemDetail  ref={(child) => { this._child = child; }}
      row={this.state.row} updateCallback={this}/>
      </div>
    )
  }
}

export default ItemTable;
