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
import CartQuantityChooser from './CartQuantityChooser';

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
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.openCartModal = this.openCartModal.bind(this);
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
                  localStorage.setItem("cart_quantity", response.requests.length);
                  this.setState({_cart: response.requests});
                }, (status, responseText)=>{console.log(JSON.parse(responseText))});
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

  openCartModal(){
    this._cartchild.openModal()
  }

  createChooserAndButton(cell, row){
    return(
      <CartQuantityChooser row={row} shouldUpdateCart={true}></CartQuantityChooser>
    );
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
      <TableHeaderColumn dataField='button' dataFormat={this.createChooserAndButton} dataAlign="center" hiddenOnInsert columnClassName='my-class'>Quantity</TableHeaderColumn>
      </BootstrapTable>
      <Button style={{marginTop: "10px", marginRight: "10px"}} className="pull-right" bsStyle="success" onClick={this.openCartModal}>Send Cart</Button>
      </div>
    );
  }


}
