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

import {Button, ButtonGroup, DropdownButton, MenuItem, FormGroup, FormControl, InputGroup} from 'react-bootstrap';

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from '../Utilities';

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
        "tags": [{"tag": "first tag"}, {"tag": "second tag"}],
        "cart_quantity": 1
      }],
      _loginState: true,
      currentSearchURL: null,
      currentPage: 1,
      totalDataSize: 0,
      tagSearchText: "",
      showModal: true
    };
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.onTagSearchClick = this.onTagSearchClick.bind(this);
    this.buttonFormatter = this.buttonFormatter.bind(this);
  }

  getAllItem(url_parameter){
    checkAuthAndAdmin(()=>{
      var url = url_parameter == null ? "/api/item/" : "/api/item/" + url_parameter;
      restRequest("GET", url, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    var response_results = response.results
                    for (var i = 0; i < response_results.length; i++){
                        // console.log(this.tagsToListString(response_results[i].tags));
                        response_results[i]["tags_data"] = response_results[i].tags;
                        response_results[i]["tags"] = this.tagsToListString(response_results[i].tags);
                        response_results[i].cart_quantity = 1;
                    }
                    this.setState({
                        _products: response_results,
                        totalDataSize: response.count
                    });
                  },
                  ()=>{
                    this.setState({
                        _loginState: false
                    });
                  })
    });
  }

  componentWillMount() {
    this.getAllItem(null)
  }

  componentDidMount(){

    document.getElementById("testing").onclick = () => {
      console.log("ahhhhhh!!!");
      alert("I clicked this");
    }
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
                      row.cart_quantity = 1;
                      this.forceUpdate();
                    }, ()=>{})
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
                    ()=>{}, ()=>{});
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
    // console.log(row);
    // console.log(isSelected);
    // console.log(e);
    if (this.state.showModal){
      //this._child.getRequests(row.name);
      this._child.getDetailedItem(row.id);
      this._child.openModal();
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

  onAddtoCartClick(cell, row){
    this.state.showModal = false;
    console.log(row);
    //this.setState({showModal: false});
    var addItemJson = JSON.stringify({
      item_id: row.id,
      quantity_requested: row.cart_quantity
    });
    restRequest("POST", "/api/shoppingCart/addItem/", "application/json", addItemJson,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  console.log(response);
                  alert("Added " + row.cart_quantity + " of " + row.name + " to cart!");
                  localStorage.setItem("cart_quantity", parseInt(localStorage.cart_quantity, 10) + 1);
                }, (status, errResponse)=>{console.log(JSON.parse(errResponse))});
  }

  generateMenuItems(cell, row){
    var menuItems = [];
    for (var i = 1; i < 11; i++){
      menuItems.push((
        <MenuItem key={"menuItem"+i} onSelect={(e, eventKey)=>{
            row.cart_quantity = e;
          }} eventKey={i}>{(i===10) ? i+"+" : i}</MenuItem>
      ))
    }
    return(
      <DropdownButton key={"asd"} id={"trying"} title={row.cart_quantity}>
        {menuItems}
      </DropdownButton>
    );
  }

  generateHighQuantityTextBox(cell, row){
    return(
                  <FormControl
                    type="number"
                    defaultValue={10}
                    style={{width: "72px"}}
                    onChange={(e)=>{row.cart_quantity=e.target.value}}
                  />

      );
  }

  buttonFormatter(cell, row) {
    //this.setState({showModal: false});
    return (
      <div id="testing" onClick={()=>{this.state.showModal=false;}}>
      <FormGroup style={{marginBottom: "0px"}} controlId="formBasicText" >
      <InputGroup>
      {(row.cart_quantity < 10) ? this.generateMenuItems(cell, row) : this.generateHighQuantityTextBox(cell, row)}
      <Button bsStyle="success" onClick={() => this.onAddtoCartClick(cell, row)}>Add to Cart</Button>
      </InputGroup>
      </FormGroup>
      </div>
    );
  }

  render() {

    //TODO: Configure options to change cursor when hovering over row

    const isAdmin = (localStorage.isAdmin === "true");

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
      onPageChange: this.onPageChange.bind(this),
      sizePerPageList: [ 30 ],
      sizePerPage: 30,
      page: this.state.currentPage
    };

    return(
      <div>
      <div className="text-right">
        <ButtonGroup>
          <Button onClick={this.onTagSearchClick} bsStyle="primary">Search Tags</Button>
          <Button onClick={() => this.onSearchChange("", null, null)}>Clear</Button>
        </ButtonGroup>
        <p>{this.state.tagSearchText}</p>
      </div>
      {this.state._loginState ? (<BootstrapTable ref="table1" remote={ true } pagination={ true } options={options} fetchInfo={ { dataTotalSize: this.state.totalDataSize } } insertRow={isAdmin} selectRow={selectRow} data={this.state._products} deleteRow={isAdmin} search={ true } striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
      <TableHeaderColumn dataField='name' editable={ { validator: this.nameValidator} }>Name</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity' editable={ { validator: this.quantityValidator} }>Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='model_number'>Model Number</TableHeaderColumn>
      <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
      <TableHeaderColumn dataField='tags'>Tags</TableHeaderColumn>
      <TableHeaderColumn dataField='button' dataFormat={this.buttonFormatter} dataAlign="center" hiddenOnInsert columnClassName='my-class'></TableHeaderColumn>
      <TableHeaderColumn dataField='tags_data' hidden hiddenOnInsert>tags_data</TableHeaderColumn>
      </BootstrapTable>) : null}

      <ItemDetail  ref={(child) => { this._child = child; }} updateCallback={this}/>
      <TagModal ref={(child) => {this._tagchild = child; }} updateCallback={this}/>
      </div>
    )
  }
}

export default ItemTable;
