var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

class RequestTable extends React.Component {

    render() {
        return(
            <BootstrapTable ref="logTable"
                            data={ this.props.data }
                            options={ this.props.options}
                            striped hover>
                <TableHeaderColumn dataField='id' isKey hidden>Id</TableHeaderColumn>
                <TableHeaderColumn dataField='item_name' width="150">Item</TableHeaderColumn>
                <TableHeaderColumn dataField='quantity' width="80">Quantity</TableHeaderColumn>
                <TableHeaderColumn dataField='status' width="100">Status</TableHeaderColumn>
                <TableHeaderColumn dataField='timestamp' width="170">Timestamp</TableHeaderColumn>
                <TableHeaderColumn dataField='reason'>Reason</TableHeaderColumn>
            </BootstrapTable>
        )
    }

}

export default RequestTable;
