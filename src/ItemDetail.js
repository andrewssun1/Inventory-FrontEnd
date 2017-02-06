//Displays detail modal with all properties of an ItemDetail
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import TextEntryFormElement from './TextEntryFormElement';
import MakeRequestModal from './MakeRequestModal';
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;

class ItemDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isAdmin: true,
      isEditing: false
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.saveEdits = this.saveEdits.bind(this);
    this.requestItem = this.requestItem.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    if(this.state.isEditing) {
      this.toggleEditing();
    }
    this.setState({showModal: false});
  }

  toggleEditing() {
    this.setState({isEditing: !this.state.isEditing});
  }

  saveEdits() {
    this.props.row.name = this._nameField.state.value;
    this.props.row.quantity = this._quantityField.state.value;
    this.props.row.model_number = this._modelNumberField.state.value;
    this.props.row.location = this._locationField.state.value;
    this.props.row.tags = this._tagsField.state.value;
    this.props.row.description = this._descriptionField.state.value;
    this.props.updateCallback.addOrUpdateRow(this.props.row, 'PATCH', this.props.row.id);
    this.props.updateCallback.componentWillMount();
    this.toggleEditing();
  }

  requestItem() {
    this.closeModal();
    this._requestModal.openModal();
    console.log('request clicked');
  }

  render() {
    //TODO: Add in image
    if(this.props.row == null) {
      return (null);
    }
    return (
      <div>
      <MakeRequestModal item={this.props.row.name} ref={(child) => { this._requestModal = child; }} />
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      {this.state.isEditing ?
        <Form horizontal>
        <TextEntryFormElement controlId="formHorizontalName" label="Name" type="text"
        initialValue={this.props.row.name} ref={(child) => {this._nameField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalQuantity" label="Quantity"
        type="number" initialValue={this.props.row.quantity} ref={(child) => {this._quantityField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalModelNumber" label="Model Number"
        type="number" initialValue={this.props.row.model_number} ref={(child) => {this._modelNumberField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalLocation" label="Location"
        type="text" initialValue={this.props.row.location} ref={(child) => {this._locationField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalTags" label="Tags"
        type="text" initialValue={this.props.row.tags} componentClass="textarea" ref={(child) => {this._tagsField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalDescription" label="Description"
        type="text" initialValue={this.props.row.description} componentClass="textarea" ref={(child) => {this._descriptionField = child;}}/>
        </Form>
        :
        <div>
        <h2> {this.props.row.name} </h2>
        <p> Quantity: {this.props.row.quantity} </p>
        <p> Model Number: {this.props.row.model_number} </p>
        <p> Location: {this.props.row.location} </p>
        <p> Tags: {this.props.row.tags} </p>
        <p> {this.props.row.description} </p>
        </div>
      }

      </Modal.Body>
      <Modal.Footer>
      {this.state.isAdmin ?
        this.state.isEditing ?
        <div>
        <Button onClick={this.saveEdits} bsStyle="primary">Save</Button>
        <Button onClick={this.toggleEditing} bsStyle="danger">Cancel</Button>
        </div>
        :
        <div>
        <Button onClick={this.toggleEditing} bsStyle="primary">Edit</Button>
        <Button onClick={this.closeModal} bsStyle="danger">Close</Button>
        </div>
        :
        <div>
        <Button onClick={this.requestItem} bsStyle="primary">Request</Button>
        <Button onClick={this.closeModal} bsStyle="danger">Close</Button>
        </div>
      }
      </Modal.Footer>
      </Bootstrap.Modal>
      </div>
    )
  }
}

export default ItemDetail
