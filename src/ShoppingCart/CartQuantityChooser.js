var React = require('react');

import '../DropdownTable.css';
import {Button, FormGroup, FormControl, InputGroup, Label} from 'react-bootstrap';

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from '../Utilities';

export default class CartQuantityChooser extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      shouldUpdateCart: false
    }
    //this.generateMenuItems = this.generateMenuItems.bind(this);
    // this.updateCart = this.updateCart.bind(this);
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
                    value={row.quantity_cartitem}
                    style={{width: "72px"}}
                    onChange={(e)=>{
                      row.quantity_cartitem=e.target.value;
                      row.shouldUpdate = row.inCart;
                      this.forceUpdate();
                    }}
                  />

      );
  }

  updateRowQuantity(row){
    checkAuthAndAdmin(()=>{
        row.shouldUpdate = false;
        console.log(row);
        var id = (row.cartId ? row.cartId : row.id);
        var Quantity = parseInt(row.quantity_cartitem, 10);
        const isStaff = (localStorage.isStaff === "true");
        var updateJSON = JSON.stringify({
            quantity: Quantity
        });
        var url = isStaff ? "/api/disburse/disbursements/"+id : "/api/shoppingCart/modifyQuantityRequested/"+id+"/";
        restRequest("PATCH", url, "application/JSON", updateJSON,
            (responseText)=>{
                this.forceUpdate();
                this.props.cb._alertchild.generateSuccess("Successfully updated quantity");
                row.original_quantity = row.quantity_cartitem;
            }, (status, errResponse)=>{
                this.props.cb._alertchild.generateError(JSON.parse(errResponse).detail);
                console.log(row.original_quantity);
                row.quantity_cartitem = row.original_quantity;
            }
        );
    })
  }

  onAddtoCartClick(row){
    checkAuthAndAdmin(()=>{
        const isStaff = (localStorage.isStaff === "true");
        var addItemJson = JSON.stringify({
            cart_id: parseInt(localStorage.activecartid, 10),
            item_id: row.id,
            quantity: row.quantity_cartitem
        });
        var url = isStaff ? "/api/disburse/disbursements/create/" : "/api/shoppingCart/addItem/";
        restRequest("POST", url, "application/json", addItemJson,
            (responseText)=>{
                var response = JSON.parse(responseText);
                console.log(response);
                //alert("Added " + row.quantity + " of " + row.name + " to cart!");
                localStorage.setItem("cart_quantity", parseInt(localStorage.cart_quantity, 10) + 1);
                this.props.cb._alertchild.generateSuccess("Successfully added " + row.quantity_cartitem + " of " + row.name + " to cart!");
                row.inCart = true;
                row.cartId = response.id;
                this.setState({shouldUpdateCart: true});
                this.forceUpdate();
            }, (status, errResponse)=>{
                let err = JSON.parse(errResponse);
                if(err.quantity != null) {
                    this.props.cb._alertchild.generateError(JSON.parse(errResponse).quantity[0]);
                } else if(err.detail != null) {
                    this.props.cb._alertchild.generateError(JSON.parse(errResponse).detail);
                }
            });
    })
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
