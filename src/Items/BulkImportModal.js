//Allows admin to add items from csv
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from "../TextEntryFormElement";
import {restRequest, restRequestData} from "../Utilities";
import {Modal, Button, Form} from 'react-bootstrap';
import Input from 'react-bootstrap';
import AlertComponent from '../AlertComponent';
import BulkImportBody from './BulkImportBody';
var fileDownload = require('react-file-download');

class BulkImportModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  render() {
    return (
      <div>
      <Bootstrap.Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Body>
      <BulkImportBody apiSource={"/api/item/csv/"} importCb={this.props.importCb} name="Items"/>
      <br /> <br />
      <BulkImportBody apiSource={"/api/item/asset/csv/"} importCb={this.props.importCb} name="Assets"/>
      </Modal.Body>
      <Modal.Footer>
      <Button onClick={this.closeModal} bsStyle="danger">Close</Button>
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default BulkImportModal;
