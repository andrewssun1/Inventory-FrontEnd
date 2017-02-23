// ShoppingCartTable.js
// Shopping Cart Table Component
// @author Andrew Sun

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import '../DropdownTable.css';
import {Button, DropdownButton, MenuItem, FormGroup, FormControl, InputGroup, Modal, Col, ControlLabel} from 'react-bootstrap';
import ShoppingCartModal from './ShoppingCartModal';

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from '../Utilities';

export default class ShoppingCartTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      _cart: [{
        "id": 111111111,
        "name": "siva",
        "quantity": null,
        "model_number": "12344567",
        "description": "This is super lit",
        "tags": [{"tag": "first tag"}, {"tag": "second tag"}],
        "cart_quantity": 1
      }]
    }
    this.buttonFormatter = this.buttonFormatter.bind(this);
    this.generateMenuItems = this.generateMenuItems.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.updateCart = this.updateCart.bind(this);
  }

  generateMenuItems(cell, row){
    var menuItems = [];
    for (var i = 1; i < 11; i++){
      menuItems.push((
        <MenuItem key={"menuItemS"+i} onSelect={(e, eventKey)=>{
            row.quantity_requested = e;
            this.updateCart(row.id, row.quantity_requested);
            //this.forceUpdate();
          }} eventKey={i}>{(i===10) ? i+"+" : i}</MenuItem>
      ))
    }
    return(
      <DropdownButton key={"asd2"} id={"trying2"} title={row.quantity_requested}>
        {menuItems}
      </DropdownButton>
    );
  }

  // updateShoppingCart(id, quantity){
  //   restRequest("PATCH", "/api/shoppingCart/modifyQuantityRequested/"+id+"/", "application/JSON", null,
  //               (responseText)=>{
  //                 var detailResponse = JSON.parse(responseText);
  //                 for (var i = 0; i < detailResponse.requests.length; i++){
  //                   detailResponse.requests[i].name = detailResponse.requests[i].item.name;
  //                 }
  //                 this.setState({_cart: detailResponse.requests});
  //               }, (status, responseText)=>{console.log(JSON.parse(responseText))});
  // }, (status, responseText)=>{console.log(JSON.parse(responseText))});
  // }

  generateHighQuantityTextBox(cell, row){
    return(
                  <FormControl
                    type="number"
                    min="1"
                    defaultValue={row.quantity_requested}
                    style={{width: "72px"}}
                    onChange={(e)=>{
                      row.quantity_requested=e.target.value;
                      row.shouldUpdate = true;
                    }}
                  />

      );
  }

  buttonFormatter(cell, row) {
    return (
      <div>
      <FormGroup style={{marginBottom: "0px"}} controlId="formBasicText" >
      <InputGroup>
      {(row.quantity_requested < 10) ? this.generateMenuItems(cell, row) : this.generateHighQuantityTextBox(cell, row)}
      {row.shouldUpdate === true ? <Button bsStyle="success" onClick={() => this.updateRowQuantity(cell, row)}>Update</Button> : null}
      </InputGroup>
      </FormGroup>
      </div>
    );
  }

  updateRowQuantity(cell, row){
    row.shouldUpdate = false;
    this.updateCart(row.id, row.quantity_requested);
  }

  // Makes sure name has at least one character
  nameValidator(value) {
    if (!value || value === ""){
      return "Name must be at least one character!"
    }
    return true;
  }

  componentWillMount(){
    restRequest("GET", "/api/shoppingCart/active/", "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  localStorage.activeCart = response.id;
                  for (var i = 0; i < response.requests.length; i++){
                    response.requests[i].name = response.requests[i].item.name;
                    response.shouldUpdate = false;
                  }
                  this.setState({_cart: response.requests});
                }, (status, responseText)=>{console.log(JSON.parse(responseText))});
  }

  updateCart(id, Quantity){
    var updateJSON = JSON.stringify({

    });
    restRequest("PATCH", "/api/shoppingCart/modifyQuantityRequested/"+id+"/", "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  this.forceUpdate();
                }, (error, responseText)=>{console.log(JSON.parse(responseText))});
  }

  onSendCartClick(){
    // update cart
    restRequest("PATCH", "/api/shoppingCart/active/", "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                }, ()=>{});
    this.closeModal();

  }

  onDeleteRow(rows){
    for (let i = 0; i < rows.length; i++){
      console.log(rows);
      restRequest("DELETE", "/api/shoppingCart/deleteItem/"+rows[i]+"/", "application/json", null,
                  ()=>{
                    localStorage.setItem("cart_quantity", parseInt(localStorage.cart_quantity, 10) - 1);
                  }, ()=>{});
    }
    this.setState({
      _cart: this.state._cart.filter((product) => {
        return rows.indexOf(product.id) === -1;
      })
    });
  }

  render(){
    const selectRow = {
      mode: 'checkbox' //radio or checkbox
    };
    const options = {
      onDeleteRow: this.onDeleteRow
    };
    return(
      <div>
      <ShoppingCartModal ref={(child) => {this._cartchild = child; }} updateCallback={this}/>
    <BootstrapTable ref="shoppingCart" selectRow={selectRow} options={options} data={this.state._cart} deleteRow striped hover>
    <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
    <TableHeaderColumn dataField='name' editable={ { validator: this.nameValidator} }>Name</TableHeaderColumn>
    <TableHeaderColumn dataField='button' dataFormat={this.buttonFormatter} dataAlign="center" hiddenOnInsert columnClassName='my-class'>Quantity</TableHeaderColumn>
    </BootstrapTable>
    <Button style={{marginTop: "10px", marginRight: "10px"}} className="pull-right" bsStyle="success">Send Cart</Button>
    </div>);
  }


}
