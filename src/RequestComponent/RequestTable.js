var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import ViewRequestModal from '../ViewRequestModal.js';

class RequestTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      row: null
    }
    this.onRowClick = this.onRowClick.bind(this);
  }

  onRowClick(row, isSelected, e) {
    this.setState({row: row});
    this._requestModal.openModal();
  }

    render() {
        return(
          <div>
          <ViewRequestModal
          item={(this.state.row != null) ? this.state.row.item_name : ""}
          quantity={(this.state.row != null) ? this.state.row.quantity : ""}
          reason={(this.state.row != null) ? this.state.row.reason : ""}
          ref={(child) => { this._requestModal = child; }} />

            <BootstrapTable ref="logTable"
                            data={ this.props.data }
                            remote={ true }
                            pagination={ true }
                            search={ true }
                            fetchInfo={ { dataTotalSize: this.props.totalDataSize } }
                            options={ this.props.options }
                            selectRow={ this.props.selectRowProp }
                            striped hover>
                <TableHeaderColumn dataField='id' isKey hidden autoValue="true">Id</TableHeaderColumn>
                <TableHeaderColumn dataField='item_name' width="150">Item</TableHeaderColumn>
                <TableHeaderColumn dataField='quantity' width="80">Quantity</TableHeaderColumn>
                <TableHeaderColumn dataField='status' width="150" filter={ { type: 'SelectFilter', options: this.props.filterFields.status } } editable={ false }>Status</TableHeaderColumn>
                <TableHeaderColumn dataField='timestamp' width="170"  editable={ false }>Timestamp</TableHeaderColumn>
                <TableHeaderColumn dataField='reason' >Reason</TableHeaderColumn>
            </BootstrapTable>
            </div>
        )
    }

}

export default RequestTable;
