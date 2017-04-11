var React = require('react');

import { Modal, Button, Label} from 'react-bootstrap';
import {restRequest, checkAuthAndAdmin} from "../Utilities.js";
import AlertComponent from '../AlertComponent';
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var Dropzone = require('react-dropzone');

export default class BackfillModal extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      showModal: false,
      modal_data: []
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  openModal(){
    this.setState({showModal: true});
  }

  closeModal(){
    this.setState({showModal: false});
  }

  onDrop(acceptedFiles, rejectedFiles) {
    if (acceptedFiles.length > 0) {
      this._alertchild.generateSuccess("Successfully uploaded: " + acceptedFiles[0].name);
    }
    else if (rejectedFiles.length > 0) {
      this._alertchild.generateError("File " + rejectedFiles[0].name + " must be a PDF");
    }
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
      <Dropzone onDrop={this.onDrop} multiple={false} accept={"application/pdf"}>
        <p>Drop or Click to Upload PDF.</p>
      </Dropzone>
    </div>
    </Modal.Body>
    <Modal.Footer>
      <Button bsStyle="danger" onClick={this.closeModal} >Close</Button>
    </Modal.Footer>
  </Modal>
);
  }


}
