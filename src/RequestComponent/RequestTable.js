var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

class RequestTable extends React.Component {
    render() {
        return(
            <BootstrapTable ref="logTable"
                            data={ this.props.data }
                            remote={true }
                            pagination={ true }
                            fetchInfo={ { dataTotalSize: this.props.totalDataSize } }
                            options={ this.props.options }
                            selectRow={ this.props.selectRowProp }
                            striped hover>
                <TableHeaderColumn dataField='id' isKey hidden autoValue="true">Id</TableHeaderColumn>
                <TableHeaderColumn dataField='item_name' width="150">Item</TableHeaderColumn>
                <TableHeaderColumn dataField='quantity' width="80">Quantity</TableHeaderColumn>
                <TableHeaderColumn dataField='status' width="150" editable={ false }>Status</TableHeaderColumn>
                <TableHeaderColumn dataField='timestamp' width="170"  editable={ false }>Timestamp</TableHeaderColumn>
                <TableHeaderColumn dataField='reason' >Reason</TableHeaderColumn>
            </BootstrapTable>
        )
    }

}

export default RequestTable;
