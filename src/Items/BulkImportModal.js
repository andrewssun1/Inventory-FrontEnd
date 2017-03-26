//Allows admin to add items from csv
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from "../TextEntryFormElement";
import {restRequest, checkAuthAndAdmin} from "../Utilities";
import {Modal, Button, Form} from 'react-bootstrap';
import Input from 'react-bootstrap';

class BulkImportModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.makeImport = this.makeImport.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  uploadFileButton() {

  }

  makeImport() {
    console.log(this._fileUpload.files);
    var data = new FormData();
    data.append("csv_file", this._fileUpload.files[0].name);
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:8000/api/item/csv/import");
    xhttp.setRequestHeader("authorization", "Token f4982e6a241258d467c91dfc3452c85416f6ce19");
    xhttp.setRequestHeader("cache-control", "no-cache");

    xhttp.send(data);
        /*
        From Siva:
        var data = new FormData();
data.append("csv_file", "items.csv");

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    console.log(this.responseText);
  }
});

xhr.open("POST", "http://localhost:8000/api/item/csv/import");
xhr.setRequestHeader("authorization", "Token f4982e6a241258d467c91dfc3452c85416f6ce19");
xhr.setRequestHeader("cache-control", "no-cache");
xhr.setRequestHeader("postman-token", "a4d36444-55be-488f-81bc-b5e9e5e16769");

xhr.send(data);
        */
  }

  render() {
    return (
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      <h4> Select File: </h4>
      <input type='file' label='Choose File' accept='.csv'
       ref={(ref) => this._fileUpload = ref} />
      <h4> Format: </h4>
      <p> Your CSV file must be in a particular format in order to be read by the database. This format is: </p>
      </Modal.Body>
      <Modal.Footer>
      <Button onClick={this.makeImport} bsStyle="success">Import</Button>
      <Button onClick={this.closeModal} bsStyle="danger">Close</Button>
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default BulkImportModal;
