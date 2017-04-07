//Allows admin to add items from csv
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import {restRequest, checkAuthAndAdmin} from "../Utilities";
import {Modal, Button, Form, Input, FormControl} from 'react-bootstrap';
import AlertComponent from '../AlertComponent';

class MinimumStockModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      currNum: 0,
      updatedItems: [],
      errItems: []
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.generateHighQuantityTextBox = this.generateHighQuantityTextBox.bind(this);
    this.saveItem = this.saveItem.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  generateHighQuantityTextBox(){
    return(
                  <FormControl
                    type="number"
                    min="1"
                    value={this.state.currNum}
                    onChange={(e)=>{
                      this.setState({currNum: parseInt(e.target.value, 10)})
                    }}
                  />

      );
  }

  saveItem() {
    checkAuthAndAdmin(()=>{
      var successStr = "Updated to minimum stock quantity of " + this.state.currNum;
      for (var i = 0; i < this.props.item_ids.length; i++) {
        var requestBody = {
            "minimum_stock": this.state.currNum,
            "track_minimum_stock": true,
          }

        var jsonResult = JSON.stringify(requestBody);
        restRequest("PATCH", "/api/item/" + this.props.item_ids[i], "application/json", jsonResult,
        (responseText)=>{
          var response = JSON.parse(responseText);
          // this.setState({successStr: this.state.successStr + response.name + ", "
          // });
          console.log(response);
        },
        (status, errResponse)=>{
          let errs = JSON.parse(errResponse);
          console.log('PATCH Failed!!');
          this.state.errItems.push(errs);
          if(errs.quantity != null) {
            for(var i = 0; i < this.state.errs.quantity.length; i ++) {
              this._alertchild.generateError(errs.quantity[i]);
            }
          }
        });
      }
      if (this.state.errItems.length === 0) {
        this.props.cb._alertchild.generateSuccess(successStr);
      }
      this.setState({
        updatedItems: [],
        errItems: []
      })
      this.closeModal();
      this.props.cb.refs.table1.cleanSelected();
      this.props.cb.resetTable();
      });
    }


  render() {
    return (
      <div>
      <Bootstrap.Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Body>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <h4> Set Minimum Stock: </h4>
      {this.generateHighQuantityTextBox()}
      </Modal.Body>
      <Modal.Footer>
      <Button onClick={this.saveItem} bsStyle="success">Save</Button>
      <Button onClick={this.closeModal} bsStyle="danger">Cancel</Button>
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default MinimumStockModal;
