// bootstraptable.js
// Example to create a simple table using React Bootstrap table
// @author Andrew Sun

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

import {Modal, Button, Form, FormGroup, Col, ControlLabel, FormControl} from 'react-bootstrap'
// var Modal = Bootstrap.Modal;
// var Button = Bootstrap.Button;
// var Form = Bootstrap.Form;
// var FormGroup = Bootstrap.FormGroup;
// var Col = Bootstrap.Col;
// var ControlLabel = Bootstrap.ControlLabel;
// var FormControl = Bootstrap.FormControl;

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin } from './Utilities';

var xhttp = new XMLHttpRequest();

class EditFormElement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: (this.props.initialValue == null) ? "" : this.props.initialValue
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
      <Modal show={this.state.showModal}>
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
      </Modal>
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
      _products: [{
        "id": 111111111,
        "name": "siva",
        "quantity": null,
        "model_number": "12344567",
        "description": "This is super lit",
        "location": "Hudson",
        "tags": [{"tag": "first tag"}, {"tag": "second tag"}]
      }],
      _loginState: true
    };
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
  }

  componentWillMount() {
    if (checkAuthAndAdmin()){
      // GET request to get all items from database
      xhttp.open("GET", "https://asap-test.colab.duke.edu/api/item/", false);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
      xhttp.send();
      var response = JSON.parse(xhttp.responseText);

      // Since setState is async, need to pass it a callback function
      this.setState({
        _products: response.results
      }, () => {
        for (var i = 0; i < this.state._products.length; i++){
              // console.log(this.tagsToListString(this.state._products[i].tags));
              this.state._products[i]["tags"] = this.tagsToListString(this.state._products[i].tags);
            }
        });
    }
    // auth failed
    else{
      this.setState({
        _loginState: false
      });
    }
  }

  // Converts JSON tags to a comma-separated string of tags
  tagsToListString(tags) {
    if(tags == null) {
      return;
    }

    var returnString = "";
    for (var i = 0; i < tags.length; i++){
      returnString = returnString.concat(tags[i].tag);
      if (i < tags.length-1){
        returnString = returnString.concat(", ");
      }
    }
    return returnString;
  }

  // Converts a comma-separated string of tags to a JSON object
  listToTags(s){
    if (!s || s.length === 0){
      return null;
    }
    var splitted = s.split(",");
    var returnList = [];
    for (var i = 0; i < splitted.length; i++){
      var tags = {};
      tags["tag"] = splitted[i].trim();
      returnList.push(tags);
    }
    return returnList;
  }

  onAddRow(row) {
    if (checkAuthAndAdmin() && row){
      // Set up the POST request
        xhttp.open("POST", "https://asap-test.colab.duke.edu/api/item/", false);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);

      // POST request returns an error
        if (xhttp.status === 401 || xhttp.status === 500){
          console.log('POST Failed!!');
        }
      // POST request able to continue
        else{
          // If the value of the item is empty, we need to
          // set it to null instead of empty string (defined by the database)
          for (var key in row){
            if (row[key] === ""){
              row[key] = null;
            }
          }
          // Changes row quantity str to int
          row.quantity = parseInt(row.quantity);

          // Deep clone the object so we don't have to convert the tags twice
          var a = JSON.parse(JSON.stringify(row));
          this.state._products.push(row);

          // Formats the row to a JSON object to send to database
          a.tags = this.listToTags(a.tags);
          delete a.id; // deletes id since object does not need it
          var jsonResult = JSON.stringify(a);

          // Send the row and parse the response
          xhttp.send(jsonResult);
          var response = JSON.parse(xhttp.responseText);
          row.id = response.id;
      }
    }
    // console.log(this.state._products);
  }

  onDeleteRow(rows) {
    if(checkAuthAndAdmin() && rows){
      for (var i = 0; i < rows.length; i++){
        xhttp.open("DELETE", "https://asap-test.colab.duke.edu/api/item/"+rows[i], false);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
        xhttp.send();
      }
      this.setState({
        _products: this.state._products.filter((product) => {
          return rows.indexOf(product.id) === -1;
        })
      })
    }
    // console.log(rows);
  }

  // Makes sure quantity is an integer
  quantityValidator(value) {
    const nan = isNaN(parseInt(value, 10));
    if (nan) {
      return 'Quantity must be a integer!';
    }
    return true;
  }

  // Makes sure name has at least one character
  nameValidator(value) {
    if (!value || value === ""){
      return "Name must be at least one character!"
    }
    return true;
  }

  onRowClick(row, isSelected, e) {
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

    const isAdmin = (localStorage.isAdmin == "true");

    const selectRow = isAdmin ? {
      mode: 'checkbox' //radio or checkbox
    } : {};

    const options = {
      onAddRow: this.onAddRow,
      onDeleteRow: this.onDeleteRow,
      onRowClick: this.onRowClick
    }

    return(
      <div>
      {this.state._loginState ? (<BootstrapTable ref="table1" options={options} insertRow={isAdmin} selectRow={selectRow} data={this.state._products} deleteRow={isAdmin} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden autoValue={true}>id</TableHeaderColumn>
      <TableHeaderColumn dataField='name' editable={ { validator: this.nameValidator} }>Name</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity' editable={ { validator: this.quantityValidator} }>Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='model_number'>Model Number</TableHeaderColumn>
      <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
      <TableHeaderColumn dataField='location'>Location</TableHeaderColumn>
      <TableHeaderColumn dataField='tags'>Tags</TableHeaderColumn>
      </BootstrapTable>) : null}

      <ItemDetail  ref={(child) => { this._child = child; }}
        name={this.state.name} quantity={this.state.quantity} model_number={this.state.model_number}
        description={this.state.description} location={this.state.location} tags={this.tagsToListString(this.state.tags)}/>
      </div>

    )
  }
}

export default ItemTable;
