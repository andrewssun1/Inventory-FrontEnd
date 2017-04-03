//Allows managers to log acquisition or loss/destruction of items
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from "../TextEntryFormElement";
import {restRequest, checkAuthAndAdmin} from "../Utilities";
import TypeConstants from "../TypeConstants";
import {Tooltip, OverlayTrigger} from 'react-bootstrap';
import AlertComponent from '../AlertComponent';
import TypeEnum from '../TypeEnum';
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;
var FormGroup = Bootstrap.FormGroup;
var Col = Bootstrap.Col;
var ControlLabel = Bootstrap.ControlLabel;
var FormControl = Bootstrap.FormControl;
var MenuItem = Bootstrap.MenuItem;
var DropdownButton = Bootstrap.DropdownButton;

class LogQuantityChangeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      requestProblemString: '',
      value: 0,
      dropdownTitle: "Acquired",
      logDisabled : true
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChangeQuantity = this.handleChangeQuantity.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.logChange = this.logChange.bind(this);
    this.onDropdownSelect = this.onDropdownSelect.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
    this.setState({logDisabled: true});
  }

  closeModal() {
    this.setState({showModal: false});
    this.setState({disableRequestButton: true});
  }

  handleChangeQuantity(evt) {
    this.setState({value: evt.target.value});
  }

  handleChange(evt) {
    this.setState({logDisabled: (this._commentsField.state.value === "")});
  }

  logChange() {
    var changeToSend = this.state.value;
    if(this.state.dropdownTitle == "Lost") {
      changeToSend = -1*changeToSend;
    }
    var requestBody = {
      "item_id": this.props.item_id,
      "quantity": changeToSend,
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

  onDropdownSelect(eventKey: any, event: Object) {
    this.setState({dropdownTitle: eventKey});
  }
  /*
  <TextEntryFormElement controlId={"formHorizontalChange"}
  label={"Change"} type={TypeConstants.Enum.INTEGER} initialValue={0}
  ref={child => this._changeField = child}/>
  */

  render() {
    return (
      <div>
      <Bootstrap.Modal show={this.state.showModal} onHide={this.closeModal}>
      <Modal.Body>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <h2> {this.props.item} </h2>
        <p>Enter negative quantity to log destruction, positive quantity to log addition</p>

      <Form horizontal>

      <FormGroup controlId={this.quantityChange}>
      <Col sm={2}>
      <FormControl componentClass={"input"}
      type={"number"}
      value={this.state.value} onChange={this.handleChangeQuantity}/>
      </Col>
      <Col sm={10}>
      <DropdownButton title={this.state.dropdownTitle}  id={'Dropdown'} onSelect={this.onDropdownSelect}>
      <MenuItem eventKey="Acquired">Acquired</MenuItem>
      <MenuItem eventKey="Lost">Lost</MenuItem>
      </DropdownButton>
      </Col>
      </FormGroup>

      <TextEntryFormElement controlId={"formHorizontalComments"}
      label={"Comments"} type={TypeConstants.Enum.LONG_STRING} initialValue={""} changeHandleCallback={this}
      ref={child => this._commentsField = child}/>
      </Form>
      </Modal.Body>
      <Modal.Footer>
      <div>
      <Button onClick={this.logChange} bsStyle="success" disabled={this.state.logDisabled}>Log Change</Button>
      <Button onClick={this.closeModal} bsStyle="danger">Cancel</Button>
      </div>
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default LogQuantityChangeModal
