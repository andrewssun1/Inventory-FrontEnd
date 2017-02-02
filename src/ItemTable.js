// bootstraptable.js
// Example to create a simple table using React Bootstrap table
// @author Andrew Sun

var React = require('react');
var ReactDOM = require('react-dom');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;


class ItemTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      _products: [{
          "name": "sivas",
          "quantity": 2,
          "model_number": "12344567",
          "description": "This is super lit",
          "location": "Hudson",
          "tags": [{"tag": "first tag"}, {"tag": "second tag"}]
      }]
    };
  }


    render() {
      const options = {
        onRowMouseOver: function(row){
          row.style.cursor='pointer';
        }
      }

        return(
            <BootstrapTable ref="table1" data={this.state._products} striped hover>
                <TableHeaderColumn isKey dataField='name'>Name</TableHeaderColumn>
                <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
                <TableHeaderColumn dataField='model_number'>Model Number</TableHeaderColumn>
                <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
                <TableHeaderColumn dataField='location'>Location</TableHeaderColumn>
                <TableHeaderColumn dataField='tags'>Tags</TableHeaderColumn>
            </BootstrapTable>
        )
    }
}

export default ItemTable;
