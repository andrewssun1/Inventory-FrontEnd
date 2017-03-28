//Allows managers to log acquisition or loss/destruction of items
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from "../TextEntryFormElement";
import {restRequest, checkAuthAndAdmin} from "../Utilities";
import TypeConstants from "../TypeConstants";
import {Tooltip, OverlayTrigger} from 'react-bootstrap';
import AlertComponent from '../AlertComponent'
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;

class LogQuantityChangeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      requestProblemString: '',
      value: 0
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.logChange = this.logChange.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
    this.setState({disableRequestButton: true});
  }

  handleChange(evt) {
    this.setState({value: evt.target.value});
    if(this.props.changeHandleCallback != null) {
      this.props.changeHandleCallback.handleChange(evt);
    }
  }

  logChange() {
    var requestBody = {
      "item_id": this.props.item_id,
      "quantity": this._changeField.state.value,
      "comment": this._commentsField.state.value
    };
    var jsonResult = JSON.stringify(requestBody);
    restRequest("POST", "/api/item/quantity", "application/json", jsonResult,
    ()=>{
      this.closeModal();
      this.props.updateCallback._alertchild.generateSuccess("Quantity change successfully logged");
      this.props.updateCallback.componentWillMount();
    },
    (status, responseText)=>{
      if (status === 401 || status === 500){
        this._alertchild.generateError('A problem occured, please contact system administrator');
      } else {
        var response = JSON.parse(responseText);
        this._alertchild.generateError(response.detail);
      }
    });
  }

  render() {
    return (
      <div>
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <h2> {this.props.item} </h2>
        <p>Enter negative quantity to log destruction, positive quantity to log addition</p>

      <Form horizontal>
      <TextEntryFormElement controlId={"formHorizontalChange"}
      label={"Change"} type={TypeConstants.Enum.INTEGER} initialValue={0}
      ref={child => this._changeField = child}/>
      <TextEntryFormElement controlId={"formHorizontalComments"}
      label={"Comments"} type={TypeConstants.Enum.LONG_STRING} initialValue={""}
      ref={child => this._commentsField = child}/>
      </Form>
      </Modal.Body>
      <Modal.Footer>
      <div>
      <Button onClick={this.logChange} bsStyle="success">Log Change</Button>
      <Button onClick={this.closeModal} bsStyle="danger">Cancel</Button>
      </div>
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default LogQuantityChangeModal
