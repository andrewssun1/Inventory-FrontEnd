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
import SelectAssetsModal from "../Requests/SelectAssetsModal.js"
import SelectionType from '../Requests/SelectionEnum.js'
import SelectAssetsButton from "../Requests/SelectAssetsButton.js"

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from '../Utilities';

  const AssetSelectStatus = {
    NOT_ASSET: 0,
    SELECT_ASSETS: 1,
    CHANGE_ASSETS: 2
  }

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
      isStaff : false,
      hasUnselectedAsset: false
    }
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.openCartModal = this.openCartModal.bind(this);
    this.createChooserAndButton = this.createChooserAndButton.bind(this);
    this.createBackfillButton = this.createBackfillButton.bind(this);
    this.openBackfillModal = this.openBackfillModal.bind(this);
    this.deleteBackfill = this.deleteBackfill.bind(this);
    this.selectAssetsButton = this.selectAssetsButton.bind(this);
    this.didFinishSelection = this.didFinishSelection.bind(this);
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
    this.setState({hasUnselectedAsset: false});
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
                  console.log(allRequest);
                  this.setState({_cart: allRequest});
                  this.refs.shoppingCart.forceUpdate();
                }, (status, responseText)=>{console.log(JSON.parse(responseText))});
  }

  iterateRequests(requestArray, type){
    for (var i = 0; i < requestArray.length; i++){
      requestArray[i].name = requestArray[i].item.name;
      requestArray[i].quantity_cartitem = requestArray[i].quantity;
      requestArray[i].shouldUpdate = false;
      requestArray[i].inCart = true;
      requestArray[i].status = type;
      if(requestArray[i].item.is_asset && requestArray[i].assets.length < requestArray[i].quantity) {
        requestArray[i].assetSelect = AssetSelectStatus.SELECT_ASSETS;
        this.setState({hasUnselectedAsset: true});
      } else if (requestArray[i].item.is_asset && requestArray[i].assets.length > 0) {
        requestArray[i].assetSelect = AssetSelectStatus.CHANGE_ASSETS;
      } else {
        requestArray[i].assetSelect = AssetSelectStatus.NOT_ASSET;
      }
    }
    return requestArray;
  }

  onDeleteRow(rows){
    const isStaff = (localStorage.isStaff === "true");
    var itemsToDelete = this.state._cart.filter((product) => {
      return rows.indexOf(product.id) !== -1;
    });
    for (let i = 0; i < itemsToDelete.length; i++){
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

  bodyHasMounted() {}

  openCartModal(){
    this._cartchild.openModal()
  }

  createChooserAndButton(cell, row){
    return(
      <CartQuantityChooser ref="cartChooser" row={row} shouldUpdateCart={true} cb={this}></CartQuantityChooser>
    );
  }

  openBackfillModal(row){
    this._backfillchild.openModal(row);
  }

  deleteBackfill(row){
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/request/backfill/active/" + row.id + "/", "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    restRequest("DELETE", "/api/request/backfill/delete/"+response.id+"/", "application/json", null,
                                ()=>{
                                  this.resetTable();
                                  this._alertchild.generateSuccess("Successfully deleted backfill.");
                                }, (status, errResponse)=>{
                                  this._alertchild.generateError(JSON.parse(errResponse).detail);
                                });
                  }, ()=>{
                  });
    });
  }

  createBackfillButton(cell, row){
    return(
      <div>
      {row.status === "loan" ? <Button bsStyle={row.has_active_backfill ? "warning" : "primary"} onClick={()=>{this.openBackfillModal(row)}}>{row.has_active_backfill ? "View Backfill" : "Create Backfill"}</Button> : null}
      {(row.status === "loan" && row.has_active_backfill) ? <Button bsStyle="danger" onClick={()=>{this.deleteBackfill(row)}}>&times;</Button> : null}
      </div>
    );
  }

  didFinishSelection() {
    this.resetTable();
  }

  selectAssetsButton(cell, row) {
    switch (row.assetSelect) {
      case AssetSelectStatus.SELECT_ASSETS:
        return(<SelectAssetsButton itemID={row.item.id} type={row.status} dispensementID={row.id}
          numAssetsNeeded={row.quantity} assets={row.assets} cb={this} style="primary" name="Select Assets"/>);
        break;
      case AssetSelectStatus.CHANGE_ASSETS:
        return(<SelectAssetsButton itemID={row.item.id} type={row.status} dispensementID={row.id}
          numAssetsNeeded={row.quantity} assets={row.assets} cb={this} style="warning" name="Change Assets"/>);
      break
      default:
        return null;
    }
  }

  render(){
    const isStaff = (localStorage.isStaff === "true");
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
      <BackfillModal ref={(child) => {this._backfillchild = child; }} cb={this}/>
      <SelectAssetsModal cartID={this.state._cart.id} updateCallback={this}
      ref={(child) => { this._selectAssetsModal = child; }}/>
      <BootstrapTable ref="shoppingCart" selectRow={selectRow} options={options} data={this.state._cart} deleteRow striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
      <TableHeaderColumn dataField='name' editable={ { validator: this.nameValidator} }>Name</TableHeaderColumn>
      <TableHeaderColumn ref="backfill" width="150px" hidden={isStaff} dataField='button' dataFormat={this.createBackfillButton} dataAlign="center" hiddenOnInsert columnClassName='my-class'></TableHeaderColumn>
      <TableHeaderColumn ref="chooser" width="300px" dataField='button' dataFormat={this.createChooserAndButton} dataAlign="center" hiddenOnInsert columnClassName='my-class'>Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='assetSelect' width="140px" dataFormat={this.selectAssetsButton}
      hidden={!isStaff}></TableHeaderColumn>
    </BootstrapTable>
      <Button style={{marginTop: "10px", marginRight: "10px"}} disabled={localStorage.cart_quantity === "0" || (this.isStaff && this.state.hasUnselectedAsset)} className="pull-right" bsStyle="success" onClick={this.openCartModal}>{this.state.isStaff ? "Checkout Dispensement" : "Checkout Cart"}</Button>
      </div>
    );
  }


}
