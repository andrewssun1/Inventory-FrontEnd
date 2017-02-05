var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

class LogTable extends React.Component {

    render() {
        return(
            <BootstrapTable ref="logTable"
                            data={ this.props.data }
                            remote={ true }
                            insertRow={ true }
                            pagination={ false }
                            options={ { onAddRow: this.props.onAddRow,
                                        onFilterChange: this.props.onFilterChange
                            } }
                            striped hover>
                <TableHeaderColumn dataField='id' isKey hidden hiddenOnInsert autoValue={true}>Id</TableHeaderColumn>
                <TableHeaderColumn dataField='user' width="100" autoValue={true}>User</TableHeaderColumn>
                <TableHeaderColumn dataField='action_tag' width="170" filter={ { type: 'SelectFilter', options: this.props.action_filter_obj } } editable={ { type: 'select', options: { values: this.props.action_list } } }>Action</TableHeaderColumn>
                <TableHeaderColumn dataField='timestamp' width="170" autoValue={true}>Timestamp</TableHeaderColumn>
                <TableHeaderColumn dataField='description'>Description</TableHeaderColumn>
            </BootstrapTable>
        )
    }

}

export default LogTable;
