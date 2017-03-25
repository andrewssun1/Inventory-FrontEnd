//Allows user to create a request
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

class ConfigureEmailModal extends React.Component {
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

  didPressSave() {
    //TODO: implement with request
  }

  render() {
    return (
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      <DateRangePicker cb={this}></DateRangePicker>
      <Form horizontal>
      <TextEntryFormElement controlId="formHorizontalSubject"
      label="Subject" type={TypeConstants.Enum.SHORT_STRING} initialValue=""
      ref={child => this._subjectElement = child}/>
      <TextEntryFormElement controlId="formHorizontalBody"
      label="Body" type={TypeConstants.Enum.LONG_STRING} initialValue=""
      ref={child => this._bodyElement = child}/>
      </Form>
      </Modal.Body>
      <Modal.Footer>
      <Button onClick={this.didPressSave} bsStyle="success">Save</Button>
      <Button onClick={this.closeModal} bsStyle="danger">Cancel</Button>
      </Modal.Footer>
      </Bootstrap.Modal>
    )
  }
}

export default ConfigureEmailModal
