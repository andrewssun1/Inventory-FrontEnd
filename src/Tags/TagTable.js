var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;

class TagTable extends React.Component {

    render() {
        return (
            <BootstrapTable ref="logTable"
                            data={ this.props.data }
                            remote={ true }
                            insertRow={ this.props.isStaff }
                            deleteRow={ this.props.isStaff }
                            options={ this.props.options }
                            selectRow={ this.props.selectRowProp }
                            striped hover>
                <TableHeaderColumn dataField='id' isKey hidden hiddenOnInsert autoValue={true}>ID</TableHeaderColumn>
                <TableHeaderColumn dataField='tag' width="170px" editable={ true }>Tag</TableHeaderColumn>
            </BootstrapTable>
        )
    }

}

export default TagTable;
