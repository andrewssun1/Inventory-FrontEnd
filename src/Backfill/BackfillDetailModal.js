var React = require('react');

import { Modal, Button, Label, FormControl} from 'react-bootstrap';
import {restRequest, restRequestData, checkAuthAndAdmin} from "../Utilities.js";
import AlertComponent from '../AlertComponent';
import BackfillDetailTable from "./BackfillDetailTable";
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var moment = require('moment');


export default class BackfillDetailModal extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      showModal: false,
      modal_data: [],
      backfill_data: [],
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal(row){
    for (var i = 0; i < row.backfill_loan.length; i++) {
      row.backfill_loan[i].timestamp = moment(row.backfill_loan[i].timestamp).format('lll');
    }
    this.setState({backfill_data: row.backfill_loan, modal_data: row}, ()=>{
      // Get all backfills
      this.setState({showModal: true});
    });
  }

  closeModal(){
    this.setState({showModal: false});
  }




  render(){

    return(
      <div>
    <Modal bsSize="large" show={this.state.showModal} onHide={this.closeModal}>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
    <Modal.Header>
      <Modal.Title>View BackFill</Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <BackfillDetailTable cb={this} data={this.state.backfill_data} requestState={this.props.requestState}/>
    </Modal.Body>
    <Modal.Footer>
      <Button bsStyle="danger" onClick={this.closeModal} >Close</Button>
    </Modal.Footer>
  </Modal>
  </div>
);
  }


}
