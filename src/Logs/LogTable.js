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
                            pagination={ true }
                            fetchInfo={ { dataTotalSize: this.props.totalDataSize } }
                            options={ { onFilterChange: this.props.onFilterChange,
                                        onRowClick: this.props.onRowClick,
                                        onPageChange: this.props.onPageChange,
                                        sizePerPageList: [ 30 ],
                                        sizePerPage: this.props.sizePerPage,
                                        page: this.props.currentPage
                            } }
                            striped hover>
                <TableHeaderColumn dataField='id' isKey hidden hiddenOnInsert autoValue={true}>Id</TableHeaderColumn>
                <TableHeaderColumn dataField='initiating_user' width="130px">Initiating User</TableHeaderColumn>
                <TableHeaderColumn dataField='affected_user' width="130px">Affected User</TableHeaderColumn>
                <TableHeaderColumn dataField='action_tag' width="170px" filter={ { type: 'SelectFilter', options: this.props.action_filter_obj } } editable={ { type: 'select', options: { values: this.props.action_list } } }>Action</TableHeaderColumn>
                <TableHeaderColumn dataField='timestamp' width="170px">Timestamp</TableHeaderColumn>
                <TableHeaderColumn dataField='comment'>Comment</TableHeaderColumn>
            </BootstrapTable>
        )
    }

}

export default LogTable;
