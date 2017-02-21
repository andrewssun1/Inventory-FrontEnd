//Displays detail modal with all properties of an ItemDetail
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
var ReactBsTable = require('react-bootstrap-table');
import TextEntryFormElement from '../TextEntryFormElement';
import MakeRequestModal from '../Request/MakeRequestModal';
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var Modal = Bootstrap.Modal;
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;
import TagComponent from '../TagComponent/TagComponent'
import {restRequest, checkAuthAndAdmin} from "../Utilities.js"

//TODO: Refactor this and Request Table, create one component that is used in both

var xhttp = new XMLHttpRequest();

class ItemDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      isEditing: false,
      itemData: null,
      outstandingRequests: null

    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.saveEdits = this.saveEdits.bind(this);
    this.requestItem = this.requestItem.bind(this);
    this.getRequests = this.getRequests.bind(this);
    this.getDetailedItem = this.getDetailedItem.bind(this);
  }

  getDetailedItem(id) {
    checkAuthAndAdmin(()=>{
      restRequest("GET", "/api/item/"+id, "application/json", null,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    console.log("Getting Response");
                    console.log(response);
                    this.setState({itemData: response});
                  },
                ()=>{console.log('GET Failed!!');}
    );
  });
}

  saveItem(cb) {
    checkAuthAndAdmin(()=>{
      var requestBody = {
        "name": this._nameField.state.value,
        "quantity": this._quantityField.state.value,
        "model_number": this._modelNumberField.state.value,
        "description": this._descriptionField.state.value,
        "location": "Nowhere until you make a user-defined field"
      };
      var jsonResult = JSON.stringify(requestBody);
      restRequest("PATCH", "/api/item/" + this.state.itemData.id, "application/json", jsonResult,
                  (responseText)=>{
                    var response = JSON.parse(responseText);
                    console.log("Getting Response");
                    console.log(response);
                    this.getDetailedItem(this.state.itemData.id);
                    cb();
                  },
                ()=>{
                  console.log('PATCH Failed!!');
                });
    });
  }


  getRequests(item_name){
    // GET request to get all outstanding requests for this item by this user
    var url;
    console.log(item_name);
    if (localStorage.isAdmin === "true") {
      url = "/api/request/?item__name="+item_name+"&status=outstanding";
    } else {
      url = "/api/request/?item__name="+item_name+"&status=outstanding";
    }
    restRequest("GET", url, "application/json", null,
              (responseText)=>{
                var response = JSON.parse(responseText);
                console.log(response);
                var response_results = response.results;
                for (var i = 0; i < response_results.length; i++){
                  response_results[i]["item"] = response_results[i].item.name;
                }
                this.setState({
                  outstandingRequests: response.results,
                  totalDataSize: response.count
                });
              }, ()=>{console.log('GET Failed!!');});
  }

  openModal() {
    console.log("opening modal");
    //this.state.showModal = true;
    this.setState({showModal: true}, ()=>{console.log(this.state.showModal)});
    this.forceUpdate();
  }

  closeModal() {
    if(this.state.isEditing) {
      this.toggleEditing();
    }
    this.props.updateCallback.componentWillMount();
    this.setState({showModal: false});
  }

  toggleEditing() {
    this.setState({isEditing: !this.state.isEditing});
  }

  saveEdits() {
    var r = confirm("Are you sure you want to save?");
    if (r) {
      this.saveItem(()=>{
        this.props.updateCallback.componentWillMount();
      });
      this.toggleEditing();
    }
  }

  requestItem() {
    this.closeModal();
    this._requestModal.openModal();
    console.log('request clicked');
  }

  render() {
    if(this.state.itemData == null) return null;

    const isAdmin = (localStorage.isAdmin === "true");

    const options = {
      sizePerPageList: [ 30 ],
      sizePerPage: 30,
      page: this.state.currentPage
    };

    return (
      <div>
      <MakeRequestModal item_id={this.state.itemData.id} item={this.state.itemData.name} ref={(child) => { this._requestModal = child; }} />
      <Bootstrap.Modal show={this.state.showModal}>
      <Modal.Body>
      {this.state.isEditing ?
        <Form horizontal>
        <TextEntryFormElement controlId="formHorizontalName" label="Name" type="text"
        initialValue={this.state.itemData.name} ref={(child) => {this._nameField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalQuantity" label="Quantity"
        type="number" initialValue={this.state.itemData.quantity} ref={(child) => {this._quantityField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalModelNumber" label="Model Number"
        type="text" initialValue={this.state.itemData.model_number} ref={(child) => {this._modelNumberField = child;}}/>
        <TextEntryFormElement controlId="formHorizontalDescription" label="Description"
        type="text" initialValue={this.state.itemData.description} componentClass="textarea" ref={(child) => {this._descriptionField = child;}}/>
        </Form>
        :
        <div>
        <h2> {this.state.itemData.name} </h2>
        <p> Quantity: {this.state.itemData.quantity} </p>
        <p> Model Number: {this.state.itemData.model_number} </p>
        <p> Description: {this.state.itemData.description} </p>
        <p> Tags: </p>
        <TagComponent item_id={this.state.itemData.id} item_detail={this.state.itemData.tags}/>
        <br />
        <h4> Requests </h4>
        <BootstrapTable ref="table1" remote={ true } pagination={ true } options={options} insertRow={false}
        data={this.state.outstandingRequests} deleteRow={false} search={false} striped hover>
        <TableHeaderColumn dataField='id' isKey hidden autoValue="true">Id</TableHeaderColumn>
        <TableHeaderColumn dataField='item' width="120px">Item</TableHeaderColumn>
        <TableHeaderColumn dataField='quantity' width="50px">Quantity</TableHeaderColumn>
        <TableHeaderColumn dataField='status' width="100px">Status</TableHeaderColumn>
        <TableHeaderColumn dataField='timestamp' width="150px">Timestamp</TableHeaderColumn>
        <TableHeaderColumn dataField='reason' width="200px">Reason</TableHeaderColumn>
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
