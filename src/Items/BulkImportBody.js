//Allows admin to add items from csv
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from "../TextEntryFormElement";
import {restRequest, restRequestData} from "../Utilities";
import {Button, Form} from 'react-bootstrap';
import Input from 'react-bootstrap';
import AlertComponent from '../AlertComponent';
var fileDownload = require('react-file-download');

class BulkImportBody extends React.Component {
  constructor(props) {
    super(props);
    this.makeImport = this.makeImport.bind(this);
    this.downloadTemplate = this.downloadTemplate.bind(this);
    this.exportItems = this.exportItems.bind(this);
  }

  makeImport(successCb, errorCb) {
    var data = new FormData();
    data.append("csv_file", this._fileUpload.files[0]);
    restRequestData("POST", this.props.apiSource + "import", data,
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
    restRequest("GET", this.props.apiSource + "export/example", "application/json", null,
                (responseText)=>{
                  console.log("Successfully got example");
                  fileDownload(responseText, 'ItemTemplate.csv');
                }, (status, errResponse)=>{
                  console.log('Failed to get example');
                });
  }

  exportItems() {
    restRequest("GET", this.props.apiSource + "export", "application/json", null,
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
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <h4> Import New {this.props.name}: </h4>
      <input type='file' label='Choose File' accept='.csv'
       ref={(ref) => this._fileUpload = ref} />
      <Button onClick={this.makeImport} bsStyle="primary">Import</Button>
      <h4> Export Current {this.props.name}: </h4>
      <Button onClick={this.exportItems} bsStyle="primary">Export</Button>
      <h4> Format: </h4>
      <p> Your CSV file must be in a particular format in order to be read by the database. Click below to dowload a preformatted csv template</p>
      <Button onClick={this.downloadTemplate} bsStyle="primary">Download Template</Button>
      </div>
    )
  }
}

export default BulkImportBody;
