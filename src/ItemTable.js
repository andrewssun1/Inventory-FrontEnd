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

class ItemDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  render() {
    return (
    <div>
    <ReactBootstrap.Modal show={this.state.showModal}>
    <Modal.Body>
    /*<ReactBootstrap.Image
        style={{width: 100, height: 100}}
        src={{uri: this.props.imagePath}}
        rounded />*/
    <h2> {this.props.name} </h2>
    <p> {this.props.description} </p>
    </Modal.Body>
    <Modal.Footer>
    <Button onClick={this.closeModal}>Close</Button>
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
          "quantity": 20,
          "model_number": "8675309",
          "description": "tfti",
          "location": "The North Pole",
          "tags": [{"tag": "first tag"}, {"tag": "second tag"}]
        }]
    };
    this.onRowSelect= this.onRowSelect.bind(this);
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
      <TableHeaderColumn dataField='tags'>Tags</TableHeaderColumn>
      </BootstrapTable>

      <ItemDetail  ref={(child) => { this._child = child; }}
      name={this.state.name} quantity={this.state.quantity} model_number={this.state.model_number}
      description={this.state.description} location={this.state.location} tags={this.state.tags}
      imagePath="./Resistor.png"/>
      </div>
    )
  }
}


export default ItemTable;
