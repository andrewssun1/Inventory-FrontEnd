//Allows admin to add items from csv
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from "../TextEntryFormElement";
import {restRequest, restRequestData} from "../Utilities";
import {Modal, Button, Form} from 'react-bootstrap';
import Input from 'react-bootstrap';
import AlertComponent from '../AlertComponent';
var fileDownload = require('react-file-download');

class BulkImportModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.makeImport = this.makeImport.bind(this);
    this.downloadTemplate = this.downloadTemplate.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  makeImport(successCb, errorCb) {
    var data = new FormData();
    data.append("csv_file", this._fileUpload.files[0]);
    restRequestData("POST", "/api/item/csv/import", data,
                (responseText)=>{
                  this.props.importCb.getAllItem(null);
                  this.props.importCb._alertchild.generateSuccess("Successfully imported items");
                  this.closeModal();
                }, (status, errResponse)=>{
                  let errs = JSON.parse(errResponse);

                  if(errs.detail != null) {
                    this._alertchild.generateError(errs.detail);
                  } else {
                  var errorString = "";
                  for (var key in errs) {
                    if (errs.hasOwnProperty(key)) {
                      let errorArray = errs[key];
                      for(var i = 0; i < errorArray.length; i ++) {
                        let errorObject = errorArray[i];
                        for(var colKey in errorObject) {
                          if(errorObject.hasOwnProperty(colKey)) {
                            errorString = errorString + "Column " + key + ", " +
                            colKey + " error: " + errorObject[colKey] + "\n";
                          }
                        }
                      }
                    }
                  }
                  if(errorString != "") {
                    this._alertchild.generateError(errorString);
                  }
                }
                });
  }

  downloadTemplate() {
    restRequest("GET", "/api/item/csv/export/example", "application/json", null,
                (responseText)=>{
                  console.log("Successfully got example");
                  fileDownload(responseText, 'ItemTemplate.csv');
                }, (status, errResponse)=>{
                  console.log('Failed to get example');
                });
  }

  exportItems() {
    restRequest("GET", "/api/item/csv/export", "application/json", null,
                (responseText)=>{
                  console.log("Successfully got items");
                  fileDownload(responseText, 'InventoryItems.csv');
                }, (status, errResponse)=>{
                  console.log('Failed to get items');
                });
  }

  render() {
    return (
      <div>
      <Bootstrap.Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Body>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <h4> Import New Items: </h4>
      <input type='file' label='Choose File' accept='.csv'
       ref={(ref) => this._fileUpload = ref} />
      <Button onClick={this.makeImport} bsStyle="primary">Import</Button>
      <h4> Export Current Items: </h4>
      <Button onClick={this.exportItems} bsStyle="primary">Export</Button>
      <h4> Format: </h4>
      <p> Your CSV file must be in a particular format in order to be read by the database. Click below to dowload a preformatted csv template</p>
      <Button onClick={this.downloadTemplate} bsStyle="primary">Download Template</Button>
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
