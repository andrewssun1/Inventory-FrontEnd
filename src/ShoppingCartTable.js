// ShoppingCartTable.js
// Shopping Cart Table Component
// @author Andrew Sun

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import './DropdownTable.css';
import {Button, ButtonGroup, DropdownButton, MenuItem, FormGroup, FormControl, InputGroup, Row} from 'react-bootstrap';

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from './Utilities';

export default class ShoppingCartTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      _cart: []
    }
    this.buttonFormatter = this.buttonFormatter.bind(this);
  }

  generateMenuItems(cell, row){
    var menuItems = [];
    for (var i = 1; i < 11; i++){
      menuItems.push((
        <MenuItem key={"menuItem"+i} onSelect={(e, eventKey)=>{
            row.quantity_requested = e;
          }} eventKey={i}>{(i===10) ? i+"+" : i}</MenuItem>
      ))
    }
    return(
      <DropdownButton key={"asd"} id={"trying"} title={row.quantity_requested}>
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
                    onChange={(e)=>{row.quantity_requested=e.target.value}}
                  />

      );
  }

  buttonFormatter(cell, row) {
    return (
      <div>
      <FormGroup style={{marginBottom: "0px"}} controlId="formBasicText" >
      <InputGroup>
      {(row.quantity_requested < 10) ? this.generateMenuItems(cell, row) : this.generateHighQuantityTextBox(cell, row)}
      </InputGroup>
      </FormGroup>
      </div>
    );
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
                  localStorage.activeCart = response.id;
                  var response = JSON.parse(responseText);
                  var currCart = response.id;
                  restRequest("GET", "/api/shoppingCart/detailed/"+currCart+"/", "application/JSON", null,
                              (responseText)=>{
                                var detailResponse = JSON.parse(responseText);
                                for (var i = 0; i < detailResponse.requests.length; i++){
                                  detailResponse.requests[i].name = detailResponse.requests[i].item.name;
                                }
                                this.setState({_cart: detailResponse.requests});
                              }, (status, responseText)=>{console.log(JSON.parse(responseText))});
                }, (status, responseText)=>{console.log(JSON.parse(responseText))});
  }

  onSendCartClick(){
    // // update cart
    // restRequest("PATCH", "/api/shoppingCart/active/", "application/JSON", null,
    //             (responseText)=>{
    //               var response = JSON.parse(responseText);
    //               var currCart = response.id;
    //             }, ()=>{});
  }

  render(){
    const selectRow = {
      mode: 'checkbox' //radio or checkbox
    };
    return(
      <div>
    <BootstrapTable ref="shoppingCart" selectRow={selectRow} data={this.state._cart} deleteRow striped hover>
    <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
    <TableHeaderColumn dataField='name' editable={ { validator: this.nameValidator} }>Name</TableHeaderColumn>
    <TableHeaderColumn dataField='button' dataFormat={this.buttonFormatter} dataAlign="center" hiddenOnInsert columnClassName='my-class'>Quantity</TableHeaderColumn>
    </BootstrapTable>
    <Button style={{marginTop: "10px", marginRight: "10px"}} className="pull-right" bsStyle="success">Send Cart</Button>
    </div>);
  }


}
