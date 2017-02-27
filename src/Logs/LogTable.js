var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import Select from 'react-select';
import '../DropdownTable.css';
import DateRangePicker from './DateRangePicker';

import { Button } from 'react-bootstrap';

import { ButtonGroup } from 'react-bootstrap-table';

class LogTable extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      users: [{label: "admin", value: "admin"}, {label: "ankit", value: "ankit"}],
      selectedUserInitiating: "",
      selectedUserAffected: ""
    }
    this.handleSelectChangeAffected = this.handleSelectChangeAffected.bind(this);
    this.handleSelectChangeInitiating = this.handleSelectChangeInitiating.bind(this);
    this.getAffectedUserFilter = this.getAffectedUserFilter.bind(this);
    this.getInitiatingUserFilter = this.getInitiatingUserFilter.bind(this);
    this.getBlah = this.getBlah.bind(this);
  }

  handleSelectChangeAffected(value){
    this.setState({selectedUserAffected: value});
    if (value === null){
      this.props.cb.setState({affectedUserURLParam: ""},
        ()=>{
          this.props.cb.getRequestForLog("", ()=>{
            this.props.cb.setState({
                currentPage:1
            });
          });
        }
      );
    }
    else{
      // do filter here....
      this.props.cb.setState({affectedUserURLParam: value},
        ()=>{
          this.props.cb.getRequestForLog("", ()=>{
            this.props.cb.setState({
                currentPage:1
            });
          });
        }
      );
    }
  }

  handleSelectChangeInitiating(value){
    this.setState({selectedUserInitiating: value});
    if (value === null){
      this.props.cb.setState({initiatingUserURLParam: ""},
        ()=>{
          this.props.cb.getRequestForLog("", ()=>{
            this.props.cb.setState({
                currentPage:1
            });
          });
        }
      );
    }
    else{
      // do filter here....
      this.props.cb.setState({initiatingUserURLParam: value},
        ()=>{
          this.props.cb.getRequestForLog("", ()=>{
            this.props.cb.setState({
                currentPage:1
            });
          });
        }
      );
    }
  }

  getAffectedUserFilter(filterHandler){
    return <Select simpleValue value={this.state.selectedUserAffected} placeholder="Select" options={this.state.users} onChange={this.handleSelectChangeAffected} />
  }

  getInitiatingUserFilter(filterHandler){
    return <Select simpleValue value={this.state.selectedUserInitiating} placeholder="Select" options={this.state.users} onChange={this.handleSelectChangeInitiating} />
  }

  getBlah(filterHandler){
    return(
      <DateRangePicker></DateRangePicker>
    );
  }


    render() {
        return(
          <div>
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
                <TableHeaderColumn dataField='initiating_user' className='my-class' width="130px" filter={{ type: 'CustomFilter', getElement: this.getInitiatingUserFilter }}>Initiating User</TableHeaderColumn>
                <TableHeaderColumn dataField='affected_user' className='my-class' width="130px" filter={{ type: 'CustomFilter', getElement: this.getAffectedUserFilter }}>Affected User</TableHeaderColumn>
                <TableHeaderColumn dataField='action_tag' width="170px" filter={ { type: 'SelectFilter', options: this.props.action_filter_obj } } editable={ { type: 'select', options: { values: this.props.action_list } } }>Action</TableHeaderColumn>
                <TableHeaderColumn dataField='timestamp' className='my-class' width="170px" filter={{ type: 'CustomFilter', getElement: this.getBlah }}>Timestamp</TableHeaderColumn>
                <TableHeaderColumn dataField='comment'>Comment</TableHeaderColumn>
                <TableHeaderColumn dataField='item_log' hidden hiddenOnInsert></TableHeaderColumn>
                <TableHeaderColumn dataField='shopping_cart_log' hidden hiddenOnInsert></TableHeaderColumn>
                <TableHeaderColumn dataField='disbursement_log' hidden hiddenOnInsert></TableHeaderColumn>
            </BootstrapTable>
          </div>
        )
    }

}

export default LogTable;
