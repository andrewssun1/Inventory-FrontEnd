//View details for asset
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from "../TextEntryFormElement";
import {restRequest, checkAuthAndAdmin} from "../Utilities";
import DateRangePicker from '../DateRangePicker.js';
import TypeConstants from '../TypeConstants.js';
import FieldViewerAndEditor from './FieldViewerAndEditor.js';
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;

class AssetDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isEditing: false,
      tag: null
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.saveEdits = this.saveEdits.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  getDetailedAsset(tag) {
    this.setState({tag: tag});
    restRequest("GET", "/api/item/asset/" + tag , "application/json", null,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Asset Response");
      console.log(response);
      this._fieldViewerAndEditor.populateFieldData(response);
      //TODO: add Error/success messages
    },
    ()=>{console.log('GET Failed!!');});
  }

  saveEdits() {
    this._fieldViewerAndEditor.saveCustomFields();
    this.toggleEditing();
    this.getDetailedAsset(this.state.tag);
  }

  toggleEditing() {
    this.setState({isEditing: !this.state.isEditing});
  }

  render() {
    return (
      <Bootstrap.Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Body>
      <FieldViewerAndEditor apiSource="/api/item/asset/field/" isEditing={this.state.isEditing} ref={(child) => { this._fieldViewerAndEditor = child; }}/>
      </Modal.Body>
      <Modal.Footer>
      {this.state.isEditing ?
        <div>
        <Button onClick={this.saveEdits} bsStyle="primary">Save</Button>
        <Button onClick={this.toggleEditing} bsStyle="danger">Cancel</Button>
        </div>
        :
        <div>
        <Button onClick={this.toggleEditing} bsStyle="primary">Edit</Button>
        <Button onClick={this.closeModal} bsStyle="danger">Cancel</Button>
        </div>
      }
      </Modal.Footer>
      </Bootstrap.Modal>
    )
  }
}

export default AssetDetail
