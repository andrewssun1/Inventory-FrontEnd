//Allows user to create a request
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from './TextEntryFormElement';
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;

var xhttp = new XMLHttpRequest();

class MakeRequestModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.makeRequest = this.makeRequest.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  makeRequest() {
    xhttp.open('POST', "https://asap-test.colab.duke.edu/api/request/", false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    if (xhttp.status === 401 || xhttp.status === 500){
      console.log('POST Failed!!');
    }
    else{
      var requestBody = {"item_id": this.props.item_id,
      "quantity": this._quantityField.state.value,
      "reason":this._reasonField.state.value};

      var jsonResult = JSON.stringify(requestBody);
      xhttp.send(jsonResult);
      var response = JSON.parse(xhttp.responseText);
      console.log("Getting Response");
      console.log(response);
    }
  }

  render() {
    return (
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      <Form horizontal>
      <TextEntryFormElement controlId="formHorizontalItem" label="Item" type="text"
      initialValue={this.props.item} ref={(child) => {this._itemField = child;}}/>
      <TextEntryFormElement controlId="formHorizontalQuantity" label="Quantity" type="number"
      initialValue={1} ref={(child) => {this._quantityField = child;}}/>
      <TextEntryFormElement controlId="formHorizontalReason" label="Reason"
      type="text" initialValue="" componentClass="textarea" ref={(child) => {this._reasonField = child;}}/>
      </Form>
      </Modal.Body>
      <Modal.Footer>
      <div>
      <Button onClick={this.makeRequest} bsStyle="primary">Make Request</Button>
      <Button onClick={this.closeModal} bsStyle="danger">Cancel</Button>
      </div>
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default MakeRequestModal
