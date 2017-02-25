var React = require('react');
var ReactBsTable = require('react-bootstrap-table');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import '../DropdownTable.css';
import {Button, DropdownButton, MenuItem, FormGroup, FormControl, InputGroup, Modal, Col, ControlLabel, Label} from 'react-bootstrap';

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from '../Utilities';

export default class CartQuantityChooser extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      shouldUpdateCart: false
    }
    //this.generateMenuItems = this.generateMenuItems.bind(this);
    this.updateCart = this.updateCart.bind(this);
  }

  componentDidMount(){
    this.setState({shouldUpdateCart: this.props.shouldUpdateCart});
    this.setState({showLabel: (this.props.showLabel === true) });
    }

  generateHighQuantityTextBox(row){
    return(
                  <FormControl
                    type="number"
                    min="1"
                    value={row.quantity_requested}
                    style={{width: "72px"}}
                    onChange={(e)=>{
                      row.quantity_requested=e.target.value;
                      row.shouldUpdate = this.state.shouldUpdateCart;
                      this.forceUpdate();
                    }}
                  />

      );
  }

  updateRowQuantity(row){
    row.shouldUpdate = false;
    console.log(row);
    var id = (row.cartId ? row.cartId : row.id);
    this.updateCart(id, parseInt(row.quantity_requested, 10));
  }

  updateCart(id, Quantity){
    var updateJSON = JSON.stringify({
      quantity_requested: Quantity
    });
    restRequest("PATCH", "/api/shoppingCart/modifyQuantityRequested/"+id+"/", "application/JSON", updateJSON,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  this.forceUpdate();
                }, (error, responseText)=>{console.log(JSON.parse(responseText))});
  }

  onAddtoCartClick(row){
    // console.log(row);
    //this.setState({showModal: false});
    var addItemJson = JSON.stringify({
      item_id: row.id,
      quantity_requested: row.quantity_requested
    });
    restRequest("POST", "/api/shoppingCart/addItem/", "application/json", addItemJson,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  console.log(response);
                  //alert("Added " + row.quantity_requested + " of " + row.name + " to cart!");
                  localStorage.setItem("cart_quantity", parseInt(localStorage.cart_quantity, 10) + 1);
                  this.props.cb._alertchild.generateSuccess("Successfully added " + row.quantity_requested + " of " + row.name + " to cart!");
                  row.inCart = true;
                  this.forceUpdate();
                }, (status, errResponse)=>{
                  this.props.cb._alertchild.generateError(JSON.parse(errResponse).detail);
                });
  }

  render(){
    var row = this.props.row;
    //console.log(row);
    return (
      <div>
      <FormGroup style={{marginBottom: "0px"}} controlId="formBasicText" >
      <InputGroup>
      {this.generateHighQuantityTextBox(row)}
      {row.shouldUpdate === true ? <Button bsStyle="success" onClick={() => this.updateRowQuantity(row)}>Update</Button> : null}
      {row.inCart === true ? null : <Button bsStyle="success" onClick={() => this.onAddtoCartClick(row)}>Add to Cart</Button>}
      {(this.state.showLabel && row.inCart) ? <Label style={{marginLeft: "5px", marginTop: "10px"}} bsStyle="info">In Cart</Label> : null}
      </InputGroup>
      </FormGroup>
      </div>
    );
  }

}
