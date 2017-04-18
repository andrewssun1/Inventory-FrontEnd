var React = require('react');

import { Modal, Button} from 'react-bootstrap';
import {restRequest, checkAuthAndAdmin} from "../Utilities.js";
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

export default class DisbursementModal extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      showModal: false,
      modal_data: []
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getDetailedDisbursement = this.getDetailedDisbursement.bind(this);
  }

  getDetailedDisbursement(id, cb){
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/disburse/"+id, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    response.disburser_name = response.disburser.username;
                    if (response.receiver !== null){
                      response.receiver_name = response.receiver.username;
                    }
                    else{
                      response.comment = "ACTIVE CART";
                    }
                    var disbursements = response.disbursements;
                    for (var j = 0; j < disbursements.length; j++){
                      disbursements[j].item_name = disbursements[j].item.name;
                    }
                    this.setState({
                      modal_data: response
                    }, ()=>{
                      cb();
                    });
                  }, ()=>{});
    });
  }

  openModal(row){
    if (row !== null){
      this.setState({modal_data: row, showModal: true});
    }
    else{
      this.setState({showModal: true});
    }
  }

  closeModal(){
    this.setState({showModal: false});
  }

  render(){
    return(
    <Modal show={this.state.showModal} onHide={this.closeModal}>
    <Modal.Header>
      <Modal.Title>View Disbursement</Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <BootstrapTable ref="disbursementModalTable" data={this.state.modal_data.disbursements} striped hover>
    <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
    <TableHeaderColumn dataField='item_name'>Item</TableHeaderColumn>
    <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
    </BootstrapTable>
    <br />
    <p><b>Disbursed By: </b>{this.state.modal_data.disburser_name}</p>
    <p><b>Receiver: </b>{this.state.modal_data.receiver_name}</p>
    <p><b>Comment: </b>{this.state.modal_data.comment}</p>
    </Modal.Body>
    <Modal.Footer>
      <Button bsStyle="danger" onClick={this.closeModal} >Close</Button>
    </Modal.Footer>
  </Modal>
);
  }


}
