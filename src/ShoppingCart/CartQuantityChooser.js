var React = require('react');
var ReactBsTable = require('react-bootstrap-table');

var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import '../DropdownTable.css';
import {Button, DropdownButton, MenuItem, FormGroup, FormControl, InputGroup, Modal, Col, ControlLabel} from 'react-bootstrap';

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
  }

  // generateMenuItems(row){
  //   var menuItems = [];
  //   for (var i = 1; i < 11; i++){
  //     menuItems.push((
  //       <MenuItem key={"menuItemS"+i} onSelect={(e, eventKey)=>{
  //           row.quantity_requested = e;
  //           if (this.state.shouldUpdateCart){
  //             this.updateCart(row.id, row.quantity_requested);
  //           }
  //           this.forceUpdate();
  //         }} eventKey={i}>{(i===10) ? i+"+" : i}</MenuItem>
  //     ))
  //   }
  //   return(
  //     <DropdownButton key={"asd2"} id={"trying2"} title={row.quantity_requested}>
  //       {menuItems}
  //     </DropdownButton>
  //   );
  // }

  generateHighQuantityTextBox(row){
    return(
                  <FormControl
                    type="number"
                    min="1"
                    defaultValue={row.quantity_requested}
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
    this.updateCart(row.id, row.quantity_requested);
    console.log("uhhh updating?")
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

  render(){
    var row = this.props.row;
    return (
      <div>
      <FormGroup style={{marginBottom: "0px"}} controlId="formBasicText" >
      <InputGroup>
      {this.generateHighQuantityTextBox(row)}
      {row.shouldUpdate === true ? <Button bsStyle="success" onClick={() => this.updateRowQuantity(row)}>Update</Button> : null}
      </InputGroup>
      </FormGroup>
      </div>
    );
  }

}
