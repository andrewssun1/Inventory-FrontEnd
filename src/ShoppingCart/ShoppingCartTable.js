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
import AlertComponent from '../AlertComponent';
import BackfillModal from '../Backfill/BackfillModal';
import ViewRequestBody from '../Requests/ViewRequestBody';

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from '../Utilities';

export default class ShoppingCartTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      bodyHasUnselectedAsset: false
    }
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.openCartModal = this.openCartModal.bind(this);
    this.deleteBackfill = this.deleteBackfill.bind(this);
    this.resetTable = this.resetTable.bind(this);
  }


  // Makes sure name has at least one character
  nameValidator(value) {
    if (!value || value === ""){
      return "Name must be at least one character!"
    }
    return true;
  }

  resetTable() {
    this.getCart(()=> {
      this._viewRequestBody.getDetailedRequest(localStorage.activecartid);
    });
  }

  componentDidMount(){
    this.resetTable();
  }


  getCart(cb) {
    // get active cart
    const isStaff = (localStorage.isStaff === "true");
    var url = "/api/request/active/";
    restRequest("GET", url, "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  localStorage.activeCart = response.id;
                  localStorage.setItem("cart_quantity", response.cart_disbursements.length + response.cart_loans.length);
                  if(cb != null) cb();
                }, (status, responseText)=>{console.log(JSON.parse(responseText))});
  }

  onDeleteRow(rows, status){
    console.log(this._viewRequestBody.state.requestData);
    const isStaff = (localStorage.isStaff === "true");
    for (let i = 0; i < rows.length; i++){
      var url = "/api/request/" + status + "/deleteItem/"+rows[i]+"/";
      restRequest("DELETE", url, "application/json", null,
                  ()=>{
                    localStorage.setItem("cart_quantity", parseInt(localStorage.cart_quantity, 10) - 1);
                    this._alertchild.generateSuccess("Successfully deleted item from cart.");
                    this.resetTable();
                  }, (status, errResponse)=>{
                    this._alertchild.generateError(JSON.parse(errResponse).detail);
                  });
    }
  }

  openCartModal(){
    this._cartchild.openModal()
  }

  deleteBackfill(row){
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/request/backfill/active/" + row.id + "/", "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    // console.log(response);
                    restRequest("DELETE", "/api/request/backfill/delete/"+response.id+"/", "application/json", null,
                                ()=>{
                                  this.resetTable();
                                  this._alertchild.generateSuccess("Successfully deleted item from cart.");
                                }, (status, errResponse)=>{
                                  this._alertchild.generateError(JSON.parse(errResponse).detail);
                                });
                  }, ()=>{
                  });
    });
  }

  render() {
    const isStaff = (localStorage.isStaff === "true");
    return(
      <div>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <ShoppingCartModal ref={(child) => {this._cartchild = child; }} updateCallback={this}/>
      <ViewRequestBody id={localStorage.activecartid} activeCartMode={true} activeCartParent={this}
      ref={(child) => {this._viewRequestBody = child; }} />

      {this._viewRequestBody != null ?
        <Button style={{marginTop: "10px", marginRight: "10px"}} disabled={localStorage.cart_quantity === "0" || this.state.bodyHasUnselectedAsset}
        className="pull-right" bsStyle="success" onClick={this.openCartModal}>{isStaff ? "Checkout Dispensement" : "Checkout Cart"}</Button>
      : null}
      </div>
    );
  }


}
