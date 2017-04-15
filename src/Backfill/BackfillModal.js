var React = require('react');

import { Modal, Button, Label, FormControl} from 'react-bootstrap';
import {restRequest, checkAuthAndAdmin} from "../Utilities.js";
import AlertComponent from '../AlertComponent';
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var Dropzone = require('react-dropzone');

const DEFAULT_IMPORT_TEXT = "Drop or Click to Upload PDF";

export default class BackfillModal extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      showModal: false,
      modal_data: [],
      import_text: DEFAULT_IMPORT_TEXT,
      backfill_quantity: 0,
      curr_file: ""
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.saveBackfill = this.saveBackfill.bind(this);
    this.generateHighQuantityTextBox = this.generateHighQuantityTextBox.bind(this);
  }

  openModal(row){
    this.setState({modal_data: row}, ()=>{
      // check if pdf and quantity is already setState
      console.log(row);
      row.send_data != null ?
        this.setState({
          backfill_quantity: row.send_data.quantity,
          curr_file: row.send_data.receipt_pdf,
          showModal: true,
          import_text: "Uploaded file: " + row.send_data.receipt_pdf.name
        }) :
        this.setState({
          backfill_quantity: 0,
          curr_file: "",
          showModal: true,
          import_text: DEFAULT_IMPORT_TEXT
        })
    });
  }

  closeModal(){
    this.setState({showModal: false});
  }

  onDrop(acceptedFiles, rejectedFiles) {
    if (acceptedFiles.length > 0) {
      this._alertchild.generateSuccess("Successfully uploaded: " + acceptedFiles[0].name);
      this.setState({import_text: "Uploaded file: " + acceptedFiles[0].name,
                     curr_file: acceptedFiles[0]})
    }
    else if (rejectedFiles.length > 0) {
      this._alertchild.generateError("File " + rejectedFiles[0].name + " must be a PDF");
    }
  }


  generateHighQuantityTextBox(){
    return(
                  <FormControl
                    type="number"
                    min="1"
                    value={this.state.backfill_quantity}
                    style={{width: "72px"}}
                    onChange={(e)=>{
                      try {
                        var valNum = parseInt(e.target.value, 10);
                          this.state.backfill_quantity=valNum;
                          this.forceUpdate();
                      } catch (e) {
                          this.props.updateCallback._alertchild.generateError("Invalid. Must be integer!!!!");
                      }
                    }}
                  />
      );
  }

  saveBackfill(){
    console.log(this.state.modal_data);
    var currJSON = {};
    currJSON.receipt_pdf = this.state.curr_file;
    currJSON.loan_id = this.state.modal_data.id;
    currJSON.quantity = this.state.backfill_quantity;
    this.state.modal_data.send_data = currJSON;
    this.closeModal();
  }

  render(){
    return(
    <Modal show={this.state.showModal} onHide={this.closeModal}>
    <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
    <Modal.Header>
      <Modal.Title>View BackFill</Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <div>
      <p>Quantity to backfill: </p>
      {this.generateHighQuantityTextBox()}
      <Dropzone onDrop={this.onDrop} multiple={false} accept={"application/pdf"}>
        <p>{this.state.import_text}</p>
      </Dropzone>
    </div>
    </Modal.Body>
    <Modal.Footer>
      <Button bsStyle="success" onClick={this.saveBackfill} >Save</Button>
      <Button bsStyle="danger" onClick={this.closeModal} >Close</Button>
    </Modal.Footer>
  </Modal>
);
  }


}
