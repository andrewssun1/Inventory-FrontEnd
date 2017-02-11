//Allows user to create a request
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from "../TextEntryFormElement";
import {checkAuthAndAdmin} from "../Utilities";
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;

var xhttp = new XMLHttpRequest();

class MakeRequestModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isAdmin: false,
      requestProblemString: '',
      disableRequestButton: true
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.makeRequest = this.makeRequest.bind(this);
    this.makeDisburse = this.makeDisburse.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
    this.setState({disableRequestButton: true});
  }

  componentWillMount(){
      checkAuthAndAdmin();
      this.setState({
        isAdmin: localStorage.isAdmin
      })
  }

  makeAPIPostRequest(url, requestBody){
      xhttp.open('POST', url, false);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
      var jsonResult = JSON.stringify(requestBody);
      xhttp.send(jsonResult);
      if (xhttp.status === 401 || xhttp.status === 500){
          this.setState({
              requestProblemString: 'A problem occured, please contact system administrator'
          })
      }
      else if(xhttp.status === 405){
          var response = JSON.parse(xhttp.responseText);
          this.setState({
            requestProblemString: response.detail
          })
      }
      else{
          this.closeModal();
      }
  }

  makeDisburse(){
    var requestBody = {
        "item_id": this.props.item_id,
        "quantity": this._quantityField.state.value,
        "receiver": this._receiverField.state.value,
        "disburse_comment": this._reasonField.state.value
    };
    this.makeAPIPostRequest("https://asap-test.colab.duke.edu/api/request/disburse/", requestBody)
  }

  makeRequest() {
    this.makeAPIPostRequest("https://asap-test.colab.duke.edu/api/request/",
        {
          "item_id": this.props.item_id,
          "quantity": this._quantityField.state.value,
          "reason":this._reasonField.state.value
        }
    )
  }

  handleChange(evt) {
    this.setState({disableRequestButton: (evt.target.value == "")});
  }

  render() {
    return (
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
        <p style={{color:"red"}}> {this.state.requestProblemString} </p>
      <Form horizontal>
      <TextEntryFormElement controlId="formHorizontalItem" label="Item" type="text"
      initialValue={this.props.item} ref={(child) => {this._itemField = child;}}/>
      <TextEntryFormElement controlId="formHorizontalQuantity" label="Quantity" type="number"
      initialValue={1} ref={(child) => {this._quantityField = child;}}/>
      <TextEntryFormElement controlId="formHorizontalReason" label="Reason"
      type="text" initialValue="" componentClass="textarea" changeHandleCallback={this} ref={(child) => {this._reasonField = child;}}/>
      {this.state.isAdmin === 'true' ? (<TextEntryFormElement controlId="formHorizontalReceiver" label="Receiver"
                                                   type="text" initialValue="" ref={(child) => {this._receiverField = child;}}/>) :
           (null)}
      </Form>
      </Modal.Body>
      <Modal.Footer>
      <div>
          {this.state.isAdmin === 'true' ? (<Button onClick={this.makeDisburse} bsStyle="success">Disburse</Button>) :
              (<Button onClick={this.makeRequest} bsStyle="primary" disabled={this.state.disableRequestButton}>Make Request</Button>)}
      <Button onClick={this.closeModal} bsStyle="danger">Cancel</Button>
      </div>
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default MakeRequestModal
