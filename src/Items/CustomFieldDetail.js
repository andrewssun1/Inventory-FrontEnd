var React = require('react');

import { Modal, Button, Form, Col, ControlLabel, DropdownButton, MenuItem } from 'react-bootstrap';
import AlertComponent from '../AlertComponent';
import TypeConstants from '../TypeConstants';
import TextEntryFormElement from '../TextEntryFormElement';
import {restRequest} from "../Utilities.js"

export default class CustomFieldDetail extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      showModal: false,
      row: null,
      isEditing: false,
      currentPrivacy: "Public"
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.saveEdits = this.saveEdits.bind(this);
    this.renderDisplayFields = this.renderDisplayFields.bind(this);
    this.renderEditFields = this.renderEditFields.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
    this.didSelectPrivacy = this.didSelectPrivacy.bind(this);
  }

  openModal(row){
    this.setState({
      showModal: true,
      row: row,
      currentPrivacy: row.private
    })
  }

  closeModal(){
    this.setState({
      showModal: false,
      isEditing: false
    })
  }

  toggleEditing() {
    this.setState({isEditing: !this.state.isEditing});
  }

  saveEdits() {
  console.log(this.state.row);

  let requestBody = {
    "name": this._nameEntryFormElement.state.value,
    "private": (this.state.currentPrivacy == "Private")
  }

  console.log(requestBody);

  var jsonResult = JSON.stringify(requestBody);
  restRequest("PATCH", "/api/item/field/" + this.state.row.id, "application/json", jsonResult,
  (responseText)=>{
    var response = JSON.parse(responseText);
    console.log("Getting Response");
    console.log(response);
    this.props.cb.getFieldData();
    this.closeModal();
  },
  ()=>{
    console.log('PATCH Failed!!');
  });
  }

  didSelectPrivacy(eventKey, event) {
    switch (eventKey) {
      case "madePublic":
        this.setState({currentPrivacy: "Public"});
        break;
      case "madePrivate":
        this.setState({currentPrivacy: "Private"});
        break;
      default:
    }
  }

  renderDisplayFields() {
    if(this.state.row == null) return null;
    console.log(this.state.row);
    return (
      <div>
      <p><b>Name: </b>{this.state.row.name}</p>
      <p><b>Type: </b>{this.state.row.type}</p>
      <p><b>Privacy: </b>{this.state.row.private}</p>
      </div>
    );
  }

  renderEditFields() {
    if(this.state.row == null) return null;
    return (
      <Form horizontal>
      <TextEntryFormElement controlId="formHorizontalName"
      label="Name:" type={TypeConstants.Enum.SHORT_STRING} initialValue={this.state.row.name}
      ref={child => this._nameEntryFormElement = child}/>
      <Col componentClass={ControlLabel} sm={2}>
      Type:
      </Col>
      <Col sm={10}>
      <DropdownButton onSelect={this.didSelectPrivacy} title={this.state.currentPrivacy} id="bg-nested-dropdown">
        <MenuItem eventKey="madePublic">Public</MenuItem>
        <MenuItem eventKey="madePrivate">Private</MenuItem>
      </DropdownButton>
      </Col>
      <br /><br />
      </Form>
    )
  }

  renderButtons() {
    let buttons = [];
    if(this.state.isEditing) {
      buttons.push(<Button key="SaveButton" onClick={this.saveEdits} bsStyle="primary">Save</Button>);
    } else {
      buttons.push(<Button key="EditButton" onClick={this.toggleEditing} bsStyle="primary">Edit</Button>);
    }
    buttons.push(<Button key="CloseButton" onClick={this.closeModal} bsStyle="danger">Close</Button>);
    return buttons;
  }

  render(){
    return(
      <div>
      <Modal show={this.state.showModal} onHide={this.closeModal}>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <Modal.Body>
      {this.state.isEditing ? this.renderEditFields() : this.renderDisplayFields()}
      </Modal.Body>
      <Modal.Footer>
        {this.renderButtons()}
      </Modal.Footer>
      </Modal>
      </div>
    );
  }

}
