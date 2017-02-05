// bootstraptable.js
// Example to create a simple table using React Bootstrap table
// @author Andrew Sun

var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var Bootstrap = require('react-bootstrap');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;
var FormGroup = Bootstrap.FormGroup;
var Col = Bootstrap.Col;
var ControlLabel = Bootstrap.ControlLabel;
var FormControl = Bootstrap.FormControl;

import { hashHistory } from 'react-router';

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
      <Bootstrap.Modal show={this.state.showModal}>
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
      </Bootstrap.Modal>
      </div>
    )
  }
}

class ItemTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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

    this.onRowSelect= this.onRowSelect.bind(this);
    this.formatTags = this.formatTags.bind(this);
  }

  componentWillMount() {
    // Get all items
    xhttp.open("GET", "https://asap-test.colab.duke.edu/api/item/", false);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    xhttp.send();
    if (xhttp.status === 401 || xhttp.status === 500){
      if(!!localStorage.token){
        delete localStorage.token;
      }
      this.setState({
        _loginState: false
      });
      hashHistory.push('/login');
      return null;
    }
    else{
      var response = JSON.parse(xhttp.responseText);
      this.setState({
        _products: response.results
      }, () => {
        for (var i = 0; i < this.state._products.length; i++){
          console.log(this.tagsToListString(this.state._products[i].tags));
          this.state._products[i]["tags"] = this.tagsToListString(this.state._products[i].tags);
        }
      });
    }
  }

  tagsToListString(tags) {
    var returnString = "";
    for (var i = 0; i < tags.length; i++){
      returnString = returnString.concat(tags[i].tag);
      if (i < tags.length-1){
        returnString = returnString.concat(", ");
      }
    }
    return returnString;
  }

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
    if (row){
      xhttp.open("POST", "https://asap-test.colab.duke.edu/api/item/", false);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
      if (xhttp.status === 401 || xhttp.status === 500){
        console.log('POST Failed!!');
      }
      else{
        for (var key in row){
          if (row[key] === ""){
            row[key] = null;
          }
        }
        row.quantity = parseInt(row.quantity);
        var a = JSON.parse(JSON.stringify(row)); // deep clone object
        this.state._products.push(row);
        a.tags = this.listToTags(a.tags);
        delete a.id;
        var jsonResult = JSON.stringify(a);
        xhttp.send(jsonResult);
        //console.log(jsonResult);
        var response = JSON.parse(xhttp.responseText);
        console.log("Getting Response");
        console.log(response);
        row.id = response.id;
      }
    }
    console.log(this.state._products);
  }

  onDeleteRow(rows) {
    if(rows){
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
    console.log(rows);
  }

  quantityValidator(value) {
    const nan = isNaN(parseInt(value, 10));
    if (nan) {
      return 'Quantity must be a integer!';
    }
    return true;
  }

  nameValidator(value) {
    if (!value || value === ""){
      return "Name must be at least one character!"
    }
    return true;
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

    const selectRow = {
      mode: 'checkbox', //radio or checkbox
      clickToSelect: false,
      onSelect: this.onRowSelect,
      hideSelectColumn: true
    };

    const options = {
      onAddRow: this.onAddRow,
      onDeleteRow: this.onDeleteRow
    }

    return(
      <div>
      {this.state._loginState ? (<BootstrapTable ref="table1" options={options} insertRow={true} selectRow={selectRow} data={this.state._products} deleteRow striped hover>
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
        description={this.state.description} location={this.state.location} tags={this.formatTags()}/>
      </div>

    )
  }
}

export default ItemTable;
