var React = require('react');

import { Modal, Button} from 'react-bootstrap';
import {restRequest} from "../Utilities.js";
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
  }

  openModal(row){
    this.setState({modal_data: row, showModal: true});
  }

  closeModal(){
    this.setState({showModal: false});
  }

  render(){
    return(
    <Modal show={this.state.showModal} onHide={this.closeModal}>
    <Modal.Header closeButton>
      <Modal.Title>View Disbursement</Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <BootstrapTable ref="disbursementModalTable" data={this.state.modal_data.disbursements} striped hover>
    <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
    <TableHeaderColumn dataField='item_name'>Item</TableHeaderColumn>
    <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
    </BootstrapTable>
    </Modal.Body>
    <Modal.Footer>
      <Button bsStyle="danger" onClick={this.closeModal} >Close</Button>
    </Modal.Footer>
  </Modal>
);
  }


}
