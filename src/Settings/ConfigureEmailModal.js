//Allows user to create a request
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from "../TextEntryFormElement";
import {restRequest, checkAuthAndAdmin, handleErrors} from "../Utilities";
import DateRangePicker from '../DateRangePicker.js';
import TypeConstants from '../TypeConstants.js';
import AlertComponent from '../AlertComponent';
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
    if(localStorage.isSuperUser === "true") {
      //Get Subject
      restRequest("GET", "/api/email/subjectTag/", "application/json", null,
      (responseText)=>{
        this.setState({subjectTag: JSON.parse(responseText).subject_tag});
      }, ()=>{});
    }

    //Get Body
    restRequest("GET", "/api/email/prependedBody/", "application/json", null,
    (responseText)=>{
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
    if(localStorage.isSuperUser === "true") {
      //Save Subject
      let requestBody = {
        "subject_tag" : this._subjectElement.state.value
      }
      let jsonResult = JSON.stringify(requestBody);

      var otherHasSuceeded = false;
      restRequest("PATCH", "/api/email/subjectTag/modify/", "application/json", jsonResult,
      (responseText)=>{
        if(otherHasSuceeded) {
          this.props.alertchild.generateSuccess("Successfully updated email configuration");
          this.closeModal();
        }
        otherHasSuceeded = !otherHasSuceeded;
      }, (status, errResponse)=>{
        handleErrors(errResponse, this._alertchild);
      });

      this.setState({subjectTag: this._subjectElement.state.value});
    }

    //Save Body
    let requestBody = {
      "prepended_body" : this._bodyElement.state.value
    }
    let jsonResult = JSON.stringify(requestBody);
    restRequest("PATCH", "/api/email/prependedBody/modify/", "application/json", jsonResult,
    (responseText)=>{
      if(otherHasSuceeded) {
        this.props.alertchild.generateSuccess("Successfully updated email configuration");
        this.closeModal();
      }
      otherHasSuceeded = !otherHasSuceeded;
    }, (status, errResponse)=>{
      handleErrors(errResponse, this._alertchild);
    });

    this.setState({prependedBody: this._bodyElement.state.value});
  }

  render() {
    let isSuperUser = (localStorage.isSuperUser === "true");
    return (
      <Bootstrap.Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Body>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <Form horizontal>
      {isSuperUser ?
      <TextEntryFormElement controlId="formHorizontalSubject"
      label="Subject" type={TypeConstants.Enum.SHORT_STRING} initialValue={this.state.subjectTag}
      ref={child => this._subjectElement = child}/> : null}
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
