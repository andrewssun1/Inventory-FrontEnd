//Displays detail modal with all properties of an ItemDetail
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
var ReactBsTable = require('react-bootstrap-table');
import TextEntryFormElement from './TextEntryFormElement';
import MakeRequestModal from './MakeRequestModal';
import ViewRequestModal from './ViewRequestModal';
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;
import TagComponent from './TagComponent/TagComponent'

//TODO: Refactor so that only the item id is passed in, and a get item detail request is made
//TODO: Refactor this and Request Table, create one component that is used in both

var xhttp = new XMLHttpRequest();

class ItemDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isEditing: false,
      outstandingRequests: null
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.saveEdits = this.saveEdits.bind(this);
    this.requestItem = this.requestItem.bind(this);
    this.getRequests = this.getRequests.bind(this);
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

  getRequests(item_name){
    // GET request to get all outstanding requests for this item by this user
    var url;
    console.log(item_name);
    if (localStorage.isAdmin == "true") {
      url = "https://asap-test.colab.duke.edu/api/request/?item__name="+item_name+"&status=outstanding";
    } else {
      url = "https://asap-test.colab.duke.edu/api/request/?item__name="+item_name+"&status=outstanding";
    }
    xhttp.open("GET", url, false);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);
    console.log(response);
    var response_results = response.results;
    for (var i = 0; i < response_results.length; i++){
        response_results[i]["item"] = response_results[i].item.name;
    }
    this.setState({
      outstandingRequests: response.results,
      totalDataSize: response.count
    });
  }

  render() {
    //TODO: Add in image
    if(this.props.row == null) {
      return (null);
    }

    const isAdmin = (localStorage.isAdmin == "true");

    const options = {
      //onRowClick: this.onRowClick,
      sizePerPageList: [ 30 ],
      sizePerPage: 30,
      page: this.state.currentPage
    };

    return (
      <div>
      <MakeRequestModal item_id={this.props.row.id} item={this.props.row.name} ref={(child) => { this._requestModal = child; }} />
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      {this.state.isEditing ?
        <Form horizontal>
        <TextEntryFormElement controlId="formHorizontalName" label="Name" type="text"
        initialValue={this.props.row.name} ref={(child) => {this._nameField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalQuantity" label="Quantity"
        type="number" initialValue={this.props.row.quantity} ref={(child) => {this._quantityField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalModelNumber" label="Model Number"
        type="text" initialValue={this.props.row.model_number} ref={(child) => {this._modelNumberField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalLocation" label="Location"
        type="text" initialValue={this.props.row.location} ref={(child) => {this._locationField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalDescription" label="Description"
        type="text" initialValue={this.props.row.description} componentClass="textarea" ref={(child) => {this._descriptionField = child;}}/>
        </Form>
        :
        <div>
        <h2> {this.props.row.name} </h2>
        <p> Quantity: {this.props.row.quantity} </p>
        <p> Model Number: {this.props.row.model_number} </p>
        <p> Location: {this.props.row.location} </p>
        <p> Description: {this.props.row.description} </p>
          <p> Tags: </p>
        <TagComponent item_id={this.props.row.id} item_detail={this.props.row.tags_data}/>
        <br />
        <h4> Requests </h4>
        <BootstrapTable ref="table1" remote={ true } pagination={ true } options={options} insertRow={false}
        data={this.state.outstandingRequests} deleteRow={false} search={false} striped hover>
        <TableHeaderColumn dataField='id' isKey hidden autoValue="true">Id</TableHeaderColumn>
        <TableHeaderColumn dataField='item' width="120">Item</TableHeaderColumn>
        <TableHeaderColumn dataField='quantity' width="50">Quantity</TableHeaderColumn>
        <TableHeaderColumn dataField='status' width="100">Status</TableHeaderColumn>
        <TableHeaderColumn dataField='timestamp' width="150">Timestamp</TableHeaderColumn>
        <TableHeaderColumn dataField='reason' width="200">Reason</TableHeaderColumn>
        </BootstrapTable>
        </div>
      }

      </Modal.Body>
      <Modal.Footer>
      {isAdmin ?
        this.state.isEditing ?
        //Buttons for an admin in editing mode
        <div>
        <Button onClick={this.saveEdits} bsStyle="primary">Save</Button>
        <Button onClick={this.toggleEditing} bsStyle="danger">Cancel</Button>
        </div>
        :
        //Buttons for an admin in viewing mode
        <div>
        <Button onClick={this.requestItem} bsStyle="success">Disburse</Button>
        <Button onClick={this.toggleEditing} bsStyle="primary">Edit</Button>
        <Button onClick={this.closeModal} bsStyle="danger">Close</Button>
        </div>
        :
        //Buttons for a user
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
