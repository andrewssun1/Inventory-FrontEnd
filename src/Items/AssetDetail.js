//View details for asset
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from "../TextEntryFormElement";
import {restRequest, checkAuthAndAdmin} from "../Utilities";
import DateRangePicker from '../DateRangePicker.js';
import TypeConstants from '../TypeConstants.js';
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;

class AssetDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
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

  getDetailedAsset(tag) {
    restRequest("GET", "/api/item/asset/" + tag , "application/json", null,
    (responseText)=>{
      var response = JSON.parse(responseText);
      console.log("Getting Asset Response");
      console.log(response);
      //TODO: add Error/success messages
    },
    ()=>{console.log('GET Failed!!');});
  }

  render() {
    return (
      <Bootstrap.Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Body>

      </Modal.Body>
      <Modal.Footer>
      <Button onClick={this.closeModal} bsStyle="danger">Cancel</Button>
      </Modal.Footer>
      </Bootstrap.Modal>
    )
  }
}

export default AssetDetail
