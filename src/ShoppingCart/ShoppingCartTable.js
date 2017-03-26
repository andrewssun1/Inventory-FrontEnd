// ShoppingCartTable.js
// Shopping Cart Table Component
// @author Andrew Sun

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import '../DropdownTable.css';
import {Button} from 'react-bootstrap';
import ShoppingCartModal from './ShoppingCartModal';
import CartQuantityChooser from './CartQuantityChooser';
import AlertComponent from '../AlertComponent'

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
      }],
      isStaff : false
    }
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.openCartModal = this.openCartModal.bind(this);
    this.createChooserAndButton = this.createChooserAndButton.bind(this);
  }


  // Makes sure name has at least one character
  nameValidator(value) {
    if (!value || value === ""){
      return "Name must be at least one character!"
    }
    return true;
  }

  componentWillMount(){
    checkAuthAndAdmin(()=>{
      this.setState({isStaff: (localStorage.isStaff === "true")})
    })
  }

  componentDidMount(){
    this.resetTable();
  }

  resetTable() {
    this.getCart();
  }

  getCart() {
    // get active cart
    const isStaff = (localStorage.isStaff === "true");
    var url = "/api/request/active/";
    restRequest("GET", url, "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  localStorage.activeCart = response.id;
                  var disburseRequest = response.cart_disbursements;
                  for (var i = 0; i < disburseRequest.length; i++){
                    disburseRequest[i].name = disburseRequest[i].item.name;
                    disburseRequest[i].quantity_cartitem = disburseRequest[i].quantity;
                    response.shouldUpdate = false;
                    disburseRequest[i].inCart = true;
                  }
                  localStorage.setItem("cart_quantity", disburseRequest.length);
                  this.setState({_cart: disburseRequest});
                }, (status, responseText)=>{console.log(JSON.parse(responseText))});
  }

  onDeleteRow(rows){
    const isStaff = (localStorage.isStaff === "true");
    for (let i = 0; i < rows.length; i++){
      console.log(rows);
      var url = "/api/request/deleteItem/"+rows[i]+"/";
      restRequest("DELETE", url, "application/json", null,
                  ()=>{
                    localStorage.setItem("cart_quantity", parseInt(localStorage.cart_quantity, 10) - 1);
                    this._alertchild.generateSuccess("Successfully deleted item from cart.");
                  }, (status, errResponse)=>{
                    this._alertchild.generateError(JSON.parse(errResponse).detail);
                  });
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
    //console.log(row);
    return(
      <CartQuantityChooser ref="cartChooser" row={row} shouldUpdateCart={true} cb={this}></CartQuantityChooser>
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
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <ShoppingCartModal ref={(child) => {this._cartchild = child; }} updateCallback={this}/>
      <BootstrapTable ref="shoppingCart" selectRow={selectRow} options={options} data={this.state._cart} deleteRow striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
      <TableHeaderColumn dataField='name' editable={ { validator: this.nameValidator} }>Name</TableHeaderColumn>
      <TableHeaderColumn ref="chooser" dataField='button' dataFormat={this.createChooserAndButton} dataAlign="center" hiddenOnInsert columnClassName='my-class'>Quantity</TableHeaderColumn>
      </BootstrapTable>
      <Button style={{marginTop: "10px", marginRight: "10px"}} disabled={localStorage.cart_quantity === "0"} className="pull-right" bsStyle="success" onClick={this.openCartModal}>{this.state.isStaff ? "Disburse" : "Send Cart"}</Button>
      </div>
    );
  }


}
