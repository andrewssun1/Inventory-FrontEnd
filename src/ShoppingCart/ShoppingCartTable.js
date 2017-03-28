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
                  var disburseRequest = this.iterateRequests(response.cart_disbursements, "disbursement");
                  var loanRequest = this.iterateRequests(response.cart_loans, "loan");
                  var allRequest = disburseRequest.concat(loanRequest);
                  localStorage.setItem("cart_quantity", allRequest.length);
                  this.setState({_cart: allRequest});
                }, (status, responseText)=>{console.log(JSON.parse(responseText))});
  }

  iterateRequests(requestArray, type){
    for (var i = 0; i < requestArray.length; i++){
      requestArray[i].name = requestArray[i].item.name;
      requestArray[i].quantity_cartitem = requestArray[i].quantity;
      requestArray[i].shouldUpdate = false;
      requestArray[i].inCart = true;
      requestArray[i].status = type;
    }
    return requestArray;
  }

  onDeleteRow(rows){
    const isStaff = (localStorage.isStaff === "true");
    var itemsToDelete = this.state._cart.filter((product) => {
      return rows.indexOf(product.id) !== -1;
    });
    for (let i = 0; i < itemsToDelete.length; i++){
      console.log(itemsToDelete);
      var url = "/api/request/" + itemsToDelete[i].status + "/deleteItem/"+itemsToDelete[i].id+"/";
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
      <Button style={{marginTop: "10px", marginRight: "10px"}} disabled={localStorage.cart_quantity === "0"} className="pull-right" bsStyle="success" onClick={this.openCartModal}>{this.state.isStaff ? "Checkout Dispensement" : "Checkout Cart"}</Button>
      </div>
    );
  }


}
