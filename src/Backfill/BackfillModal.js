var React = require('react');

import { Modal, Button, Label, FormControl} from 'react-bootstrap';
import {restRequest, restRequestData, checkAuthAndAdmin, handleErrors} from "../Utilities.js";
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
      curr_file: "",
      new_backfill: false,
      backfill_data: {},
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.saveBackfill = this.saveBackfill.bind(this);
    this.generateHighQuantityTextBox = this.generateHighQuantityTextBox.bind(this);
  }

  openModal(row){
    this.setState({modal_data: row}, ()=>{
      // Check whether or not there is already an active backfill
      console.log(this.state.modal_data);
      checkAuthAndAdmin(()=>{
        restRequest("GET", "/api/request/backfill/active/" + row.id + "/", "application/json", null,
                    (responseText)=>{
                      var response = JSON.parse(responseText);
                      console.log(response);
                      row.backfill_quantity = parseInt(response.quantity, 10);
                      this.setState({
                        backfill_quantity: response.quantity,
                        import_text: "Uploaded file: " + response.file_name,
                        backfill_data: response,
                        new_backfill: false
                      });
                    }, ()=>{
                      this.setState({
                        backfill_quantity: 0,
                        import_text: DEFAULT_IMPORT_TEXT,
                        backfill_data: {},
                        curr_file: "",
                        new_backfill: true
                      });
                    });
      });
      this.setState({showModal: true});
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
    // console.log(this.state.modal_data);

    var data = new FormData();
    // console.log(this.state.curr_file);
    data.append("receipt_pdf", this.state.curr_file);
    this.state.new_backfill ? data.append("loan_id", this.state.modal_data.id) : data.append("backfill_id", this.state.backfill_data.id);
    data.append("quantity", this.state.backfill_quantity);
    console.log(this.state.new_backfill);
    this.state.new_backfill ? console.log("new backfill: ", data.get("loan_id")) :  console.log("updating backfill: ", data.get("backfill_id"))

    // this.state.modal_data.send_data = currJSON;
    if (this.state.new_backfill){
      checkAuthAndAdmin(()=>{
        restRequestData("POST", "/api/request/backfill/create/", data,
                    (responseText)=>{
                      var response = JSON.parse(responseText);
                      if (typeof this.props.cb.resetTable === "function") {
                        this.props.cb.resetTable();
                      }
                      this.props.cb._alertchild.generateSuccess("Successfully saved backfill");
                      console.log(response);
                    },(status, errResponse)=>{
                      handleErrors(errResponse, this.props.cb._alertchild);
                    });
      });
    }
    else{
      checkAuthAndAdmin(()=>{
        restRequestData("POST", "/api/request/backfill/update/", data,
                    (responseText)=>{
                      var response = JSON.parse(responseText);
                      if (typeof this.props.cb.resetTable === "function") {
                        this.props.cb.resetTable();
                      }
                      this.props.cb._alertchild.generateSuccess("Successfully saved backfill");
                      console.log(response);
                    }, (status, errResponse)=>{
                      handleErrors(errResponse, this.props.cb._alertchild);
                    });
      });
    }


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
