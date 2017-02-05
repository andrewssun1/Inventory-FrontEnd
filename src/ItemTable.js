// bootstraptable.js
// Example to create a simple table using React Bootstrap table
// @author Andrew Sun
var React = require('react');
var ReactDOM = require('react-dom');
var ReactBsTable = require('react-bootstrap-table');
var ReactBootstrap = require('react-bootstrap');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Form = ReactBootstrap.Form;
var FormGroup = ReactBootstrap.FormGroup;
var Col = ReactBootstrap.Col;
var ControlLabel = ReactBootstrap.ControlLabel;
var FormControl = ReactBootstrap.FormControl;

class EditFormElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.initialValue
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    this.setState({value: evt.target.value});
  }

  render() {
    return (
      <FormGroup controlId={this.props.controlId}>
      <Col componentClass={ControlLabel} sm={2}>
      {this.props.label}
      </Col>
      <Col sm={10}>
      <FormControl componentClass={this.props.componentClass} type={this.props.type} value={this.state.value} onChange={this.handleChange}/>
      </Col>
      </FormGroup>
    )
  }
}

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
    this.makeRequest = this.makeRequest.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.saveEdits = this.saveEdits.bind(this);
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

  makeRequest() {
    //TODO: implement
    console.log('request');
  }

  toggleEditing() {
    this.setState({isEditing: !this.state.isEditing});
  }

  saveEdits() {
    console.log("Save edits");
  }

  render() {
    //TODO: Add in image
    return (
      <div>
      <ReactBootstrap.Modal show={this.state.showModal}>
      <Modal.Body>

      {this.state.isEditing ?
        <Form horizontal>
        <EditFormElement controlId="formHorizontalName" label="Name" type="text" initialValue={this.props.name}/>
        <EditFormElement controlId="formHorizontalQuantity" label="Quantity" type="number" initialValue={this.props.quantity}/>
        <EditFormElement controlId="formHorizontalModelNumber" label="Model Number" type="number" initialValue={this.props.model_number}/>
        <EditFormElement controlId="formHorizontalLocation" label="Location" type="text" initialValue={this.props.location}/>
        <EditFormElement controlId="formHorizontalDescription" label="Description" type="text" initialValue={this.props.description} componentClass="textarea"/>
        </Form>
        :
        <div>
        <h2> {this.props.name} </h2>
        <p> Quantity: {this.props.quantity} </p>
        <p> Model Number: {this.props.model_number} </p>
        <p> Location: {this.props.location} </p>
        <p> Tags: {this.props.tags} </p>
        <p> {this.props.description} </p>
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
        <Button onClick={this.closeModal} bsStyle="danger">Close</Button>
      }

      </Modal.Footer>
      </ReactBootstrap.Modal>
      </div>
    )
  }
}

class ItemTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: null,
      quantity: 0,
      model_number: 0,
      description: null,
      location: null,
      tags: null,
      _products: [
        {
          "name": "sivas",
          "quantity": 2,
          "model_number": "12344567",
          "description": "This is super lit",
          "location": "Hudson",
          "tags": [{"tag": "first tag"}, {"tag": "second tag"}]
        },

        {
          "name": "crumb-bums",
          "quantity": 4,
          "model_number": "8675309",
          "description": "tfti",
          "location": "The Edge",
          "tags": [{"tag": "Andrew"}, {"tag": "Ankit"}, {"tag": "Patrick"}, {"tag": "Siva"}]
        }]
      };
      this.onRowSelect= this.onRowSelect.bind(this);
      this.formatTags = this.formatTags.bind(this);
    }

    formatTags() {
      if(this.state.tags == null) {
        return "";
      }
      var result = "";
      var count;
      for(count = 0; count < this.state.tags.length; count++) {
        result = result + this.state.tags[count].tag;
        if(count < this.state.tags.length - 1) {
          result = result + ", ";
        }
      }
      return result;
    }

    onRowSelect(row, isSelected, e) {
      this.setState({name: row.name});
      this.setState({quantity: row.quantity});
      this.setState({model_number: row.model_number});
      this.setState({description: row.description});
      this.setState({location: row.location});
      this.setState({tags: row.tags});
      this._child.openModal();
    }

    render() {

      //TODO: Configure options to change cursor when hovering over row

      const selectRowProp = {
        mode: 'checkbox',
        clickToSelect: true,
        onSelect: this.onRowSelect,
        hideSelectColumn: true
      }

      return(
        <div>
        <BootstrapTable ref="table1" data={this.state._products} selectRow={selectRowProp} striped hover>
        <TableHeaderColumn isKey dataField='name'>Name</TableHeaderColumn>
        <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
        <TableHeaderColumn dataField='model_number'>Model Number</TableHeaderColumn>
        <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
        <TableHeaderColumn dataField='location'>Location</TableHeaderColumn>
        </BootstrapTable>

        <ItemDetail  ref={(child) => { this._child = child; }}
        name={this.state.name} quantity={this.state.quantity} model_number={this.state.model_number}
        description={this.state.description} location={this.state.location} tags={this.formatTags()}/>
        </div>
      )
    }
  }


  export default ItemTable;
