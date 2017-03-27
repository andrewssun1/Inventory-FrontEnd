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
      showModal: false,
      subjectTag: "",
      prependedBody: ""
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.didPressSave = this.didPressSave.bind(this);
  }

  componentWillMount() {
    //Get Subject
    restRequest("GET", "/api/email/subjectTag/", "application/json", null,
    (responseText)=>{
      console.log("Successfully got the subject tag");
      console.log(JSON.parse(responseText));
      this.setState({subjectTag: JSON.parse(responseText).subject_tag});
    }, ()=>{});

    //Get Body
    restRequest("GET", "/api/email/prependedBody/", "application/json", null,
    (responseText)=>{
      console.log("Successfully got the prepended body");
      console.log(JSON.parse(responseText));
      this.setState({prependedBody: JSON.parse(responseText).prepended_body});
    }, ()=>{});
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  didPressSave() {
    //Save Subject
    let requestBody = {
      "subject_tag" : this._subjectElement.state.value
    }
    let jsonResult = JSON.stringify(requestBody);
    restRequest("PATCH", "/api/email/subjectTag/modify/", "application/json", jsonResult,
    (responseText)=>{
      console.log("Successfully updated request body!");
      console.log(JSON.parse(responseText));
    }, ()=>{});

    //Save Body
    requestBody = {
      "prepended_body" : this._bodyElement.state.value
    }
    jsonResult = JSON.stringify(requestBody);
    restRequest("PATCH", "/api/email/prependedBody/modify/", "application/json", jsonResult,
    (responseText)=>{
      console.log("Successfully updated request body!");
      console.log(JSON.parse(responseText));
    }, ()=>{});

    this.setState({subjectTag: this._subjectElement.state.value});
    this.setState({prependedBody: this._bodyElement.state.value});
    this.closeModal();
  }

  render() {
    return (
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      <DateRangePicker cb={this}></DateRangePicker>
      <Form horizontal>
      <TextEntryFormElement controlId="formHorizontalSubject"
      label="Subject" type={TypeConstants.Enum.SHORT_STRING} initialValue={this.state.subjectTag}
      ref={child => this._subjectElement = child}/>
      <TextEntryFormElement controlId="formHorizontalBody"
      label="Body" type={TypeConstants.Enum.LONG_STRING} initialValue={this.state.prependedBody}
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
