var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import Select from 'react-select';
import '../DropdownTable.css';
import DateRangePicker from './DateRangePicker';

import { Button } from 'react-bootstrap';

import { ButtonGroup } from 'react-bootstrap-table';

import {restRequest} from '../Utilities'

class LogTable extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      users: [],
      selectedUserInitiating: "",
      selectedUserAffected: ""
    }
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.getUserFilter = this.getUserFilter.bind(this);
    this.getDateRangePicker = this.getDateRangePicker.bind(this);
  }

  componentDidMount(){
    restRequest("GET", "/api/user/large/", "application/JSON", null,
                (responseText)=>{
                  var response = JSON.parse(responseText);
                  for (var i = 0; i < response.results.length; i++){
                    var username = response.results[i].username;
                    this.state.users.push({label: username, value: username});
                  }
                  this.setState({showModal: true});
                }, ()=>{});
  }

  handleSelectChange(value, type){
    var stateVar = ((type === "initiating") ? "initiatingUserURLParam" : "affectedUserURLParam");
    var state = {};
    var valVar = ((type === "initiating") ? "selectedUserInitiating" : "selectedUserAffected");
    var valState = {};
    valState[valVar] = value;
    state["currentPage"] = 1;
    this.setState(valState);
    if (value === null){
      state[stateVar] = "";
      this.props.cb.setState(state,
        ()=>{
          this.props.cb.getRequestForLog("", ()=>{
          });
        }
      );
    }
    else{
      // do filter here....
      state[stateVar] = value;
      this.props.cb.setState(state,
        ()=>{
          this.props.cb.getRequestForLog("", ()=>{
          });
        }
      );
    }
  }

  getUserFilter(filterHandler, customFilterParameters){
    var type = customFilterParameters.type;
    return <Select simpleValue
                   value={(type === "initiating") ? this.state.selectedUserInitiating : this.state.selectedUserAffected}
                   placeholder="Select"
                   options={this.state.users}
                   onChange={(value)=>{this.handleSelectChange(value, type)}} />
  }


  getDateRangePicker(filterHandler){
    return(
      <DateRangePicker cb={this.props.cb}></DateRangePicker>
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
                <TableHeaderColumn dataField='initiating_user' className='my-class' width={this.props.lightMode ? "108px" : "130px"} filter={this.props.lightMode ? null : { type: 'CustomFilter', getElement: this.getUserFilter, customFilterParameters: {type: "initiating"} }}>Initiating User</TableHeaderColumn>
                <TableHeaderColumn dataField='affected_user' className='my-class' width={this.props.lightMode ? "108px" : "130px"} filter={this.props.lightMode ? null : { type: 'CustomFilter', getElement: this.getUserFilter, customFilterParameters: {type: "affected"}  }}>Affected User</TableHeaderColumn>
                <TableHeaderColumn dataField='action_tag' width="170px" filter={this.props.lightMode ? null : { type: 'SelectFilter', options: this.props.action_filter_obj } } editable={ { type: 'select', options: { values: this.props.action_list } } }>Action</TableHeaderColumn>
                <TableHeaderColumn dataField='timestamp' width="160px" className='my-class'  filter={this.props.lightMode ? null : { type: 'CustomFilter', getElement: this.getDateRangePicker }}>Timestamp</TableHeaderColumn>
                <TableHeaderColumn dataField='comment'>Comment</TableHeaderColumn>
                <TableHeaderColumn dataField='item_log' hidden hiddenOnInsert></TableHeaderColumn>
                <TableHeaderColumn dataField='cart_disbursements' hidden hiddenOnInsert></TableHeaderColumn>
            </BootstrapTable>
          </div>
        )
    }

}

export default LogTable;
